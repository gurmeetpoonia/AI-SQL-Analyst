import json
import time

from google import genai
from google.genai import types
from fastapi import HTTPException

from app.config import GEMINI_API_KEY
from app.aiEditor.services.dataset_editor_prompt import build_dataset_editor_prompt
from app.aiAnalyst.services.gemini_service import get_database_schema
from app.aiEditor.services.sql_builder import build_sql
from app.aiEditor.services.sql_validator import validate_edit_sql
from app.aiEditor.crud.dataset_editor_crud import preview_query, execute_query
from app.upload.crud.upload_crud import get_uploaded_file_by_table_name
from app.aiEditor.services.diff_service import preview_diff
from app.models import UploadedFile
from app.aiEditor.crud.version_history_api import get_versions
from app.aiEditor.model.datasetVersion import DatasetVersion
from app.aiEditor.crud.dataset_version_crud import (
    create_snapshot,
    save_version,
    rename_version,
    delete_version
)
from app.aiEditor.crud.restore_version_crud import restore_snapshot
from app.aiEditor.crud.edit_history_crud import (
    create_backup,
    save_history
)
from app.aiEditor.crud.undo_crud import restore_backup
from app.aiEditor.model.edit_history import EditHistory
from app.utils.json_safe import sanitize_json
client = genai.Client(api_key=GEMINI_API_KEY)


def generate_edit_plan(
    engine,
    table_name: str,
    user_request: str
):
    schema = get_database_schema(engine, [table_name])

    prompt = build_dataset_editor_prompt(
        schema=schema,
        sample_data=[],
        user_request=user_request
    )

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    print("DEBUG -> RAW GEMINI RESPONSE:", response.text)

    try:
        return json.loads(response.text)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate edit plan."
        )


def preview_plan(engine, plan):
    if isinstance(plan, dict) and "plan" in plan and "steps" not in plan:
        plan = plan["plan"]

    if isinstance(plan, dict) and "steps" in plan:
        steps = plan["steps"]
    elif isinstance(plan, dict):
        steps = [plan]
    elif isinstance(plan, list) and len(plan) > 0:
        steps = plan
    else:
        raise ValueError("Invalid plan structure.")

    all_results = []
    combined_affected = 0

    for step in steps:
        built = build_sql(step, engine=engine)
        preview_sql = built.get("preview_sql")
        preview = []

        if preview_sql:
            validate_edit_sql(preview_sql)
            preview = preview_query(
                engine,
                preview_sql,
                built.get("preview_params", {})
            )

        print("DEBUG -> Generated SQL:", built["sql"])
        print("DEBUG -> Generated Preview SQL:", built["preview_sql"])

        all_results.append({
            "preview": preview,
            "sql_preview": built["sql"],
            "affected_rows": len(preview) if preview else 0,
            "step": step
        })
        combined_affected += len(preview) if preview else 0

    return {
        "results": sanitize_json(all_results),
        "total_affected_rows": combined_affected,
        "plan": plan
    }


def get_columns_affected(step) -> str | None:
    if step.get("columns"):
        cols = step["columns"]
        if isinstance(cols, list):
            return ", ".join(cols)
        return str(cols)

    if step.get("column"):
        return step["column"]

    return None


def execute_plan(
    db,
    engine,
    plan,
    current_user,
    user_request
):
    outputs = []

    try:
        steps = plan.get("steps")
        if not steps:
            raise HTTPException(
                status_code=400,
                detail="No executable steps generated."
            )

        for step in steps:
            step_start = time.perf_counter()

            uploaded_file = get_uploaded_file_by_table_name(
                db=db,
                table_name=step["table_name"],
                user_id=current_user.id
            )

            if uploaded_file is None:
                raise HTTPException(
                    status_code=404,
                    detail="Dataset not found."
                )

            sql_data = build_sql(step, engine=engine)

            backup = create_backup(engine, step["table_name"])

            save_history(
                db=db,
                user_id=current_user.id,
                table_name=step["table_name"],
                action=step["action"],
                sql=sql_data["sql"],
                backup_json=backup
            )

            snapshot = create_snapshot(engine, step["table_name"])

            before = preview_query(
                engine,
                sql_data["preview_sql"],
                sql_data["preview_params"]
            )

            rows = execute_query(
                engine,
                sql_data["sql"],
                sql_data.get("params", {})
            )

            after = preview_query(
                engine,
                f"SELECT * FROM {step['table_name']} ;",
                {}
            )
            diff = preview_diff(before, after)

            step_time = round(time.perf_counter() - step_start, 4)

            # FIX: prompt schema me field ka naam "impact_summary" hai, "explanation" nahi —
            # isliye ai_summary hamesha empty aa raha tha aur frontend "Dataset Update" fallback dikhata tha
            save_version(
                db=db,
                uploaded_file_id=uploaded_file.id,
                snapshot_json=snapshot,
                edit_prompt=user_request,
                ai_summary=step.get("impact_summary"),
                sql_executed=sql_data["sql"],
                rows_changed=rows,
                columns_affected=get_columns_affected(step),
                execution_time=step_time
            )

            outputs.append({
                "sql": sql_data["sql"],
                "rows_affected": rows,
                "diff": diff
            })

        db.commit()

        return {
            "success": True,
            "steps_executed": len(outputs),
            "results": sanitize_json(outputs)
        }

    except Exception:
        db.rollback()
        raise


def undo_last_edit(
    db,
    engine,
    current_user,
    table_name
):
    history = (
        db.query(EditHistory)
        .filter(
            EditHistory.user_id == current_user.id,
            EditHistory.table_name == table_name
        )
        .order_by(EditHistory.id.desc())
        .first()
    )

    if history is None:
        return {
            "message": "Nothing to undo."
        }

    restore_backup(
        engine,
        history.table_name,
        history.backup_json
    )

    db.delete(history)
    db.commit()

    return {
        "message": "Undo successful."
    }


def restore_version(
    db,
    engine,
    version_id,
    current_user
):
    """
    FIX: Pehle ye function sirf live table ko overwrite karta tha
    (restore_snapshot), aur koi naya version record nahi banata tha.
    Isse history "gayab" hoti mehsoos hoti thi — actual data version 2
    jaisa ho jaata tha lekin version 3, 4 ke records ka current state
    se koi connection nahi bacha rehta tha, aur purani versions kabhi
    delete nahi hui thi lekin history confusing lag rahi thi.

    Ab restore Git/Google Docs/Figma jaisa kaam karega:
    1. Live table ko target version ke data se update karo (taaki
       user ko turant restored data dikhe).
    2. Ek NAYA version record banao jo restored version ki exact copy
       ho — is naye version ko latest version number milega.
    3. Purani koi bhi version (3, 4, etc.) kabhi delete/overwrite
       nahi hoti — sab history me hamesha safe rehti hai, aur user
       kabhi bhi future me unpe wapas restore kar sakta hai.
    """
    version = db.query(DatasetVersion).filter(
        DatasetVersion.id == version_id
    ).first()

    if version is None:
        raise HTTPException(
            status_code=404,
            detail="Version not found."
        )

    uploaded = db.query(UploadedFile).filter(
        UploadedFile.id == version.uploaded_file_id,
        UploadedFile.user_id == current_user.id
    ).first()

    if uploaded is None:
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    # STEP 1: Live table ko target version ke snapshot se update karo
    restore_snapshot(
        engine,
        uploaded.table_name,
        version.snapshot_json
    )

    # STEP 2: Naya version banao jo restored state ko represent kare
    # — purane versions ko bilkul touch nahi kiya
    version_label = (
        f" ({version.custom_name})" if version.custom_name else ""
    )

    new_version = save_version(
        db=db,
        uploaded_file_id=version.uploaded_file_id,
        snapshot_json=version.snapshot_json,
        edit_prompt=f"Restored from Version {version.version}{version_label}",
        ai_summary=f"Dataset restored to the state of Version {version.version}{version_label}.",
        sql_executed=None,
        rows_changed=None,
        columns_affected=None,
        execution_time=None
    )

    return {
        "message": f"Version {version.version} restored successfully as new Version {new_version.version}.",
        "restored_from_version": version.version,
        "new_version_id": new_version.id,
        "new_version_number": new_version.version
    }


def version_history(
    db,
    uploaded_file_id,
    current_user
):
    uploaded = (
        db.query(UploadedFile)
        .filter(
            UploadedFile.id == uploaded_file_id,
            UploadedFile.user_id == current_user.id
        )
        .first()
    )

    if uploaded is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found."
        )

    versions = (
        db.query(DatasetVersion)
        .filter(
            DatasetVersion.uploaded_file_id == uploaded_file_id
        )
        .order_by(
            DatasetVersion.version.desc()
        )
        .all()
    )

    return versions


def rename_version_service(
    db,
    version_id,
    new_name,
    current_user
):
    version = db.query(DatasetVersion).filter(
        DatasetVersion.id == version_id
    ).first()

    if version is None:
        raise HTTPException(
            status_code=404,
            detail="Version not found."
        )

    uploaded = db.query(UploadedFile).filter(
        UploadedFile.id == version.uploaded_file_id,
        UploadedFile.user_id == current_user.id
    ).first()

    if uploaded is None:
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    updated = rename_version(db, version_id, new_name)

    return {
        "message": "Version renamed.",
        "id": updated.id,
        "custom_name": updated.custom_name
    }


def delete_version_service(
    db,
    version_id,
    current_user
):
    version = db.query(DatasetVersion).filter(
        DatasetVersion.id == version_id
    ).first()

    if version is None:
        raise HTTPException(
            status_code=404,
            detail="Version not found."
        )

    uploaded = db.query(UploadedFile).filter(
        UploadedFile.id == version.uploaded_file_id,
        UploadedFile.user_id == current_user.id
    ).first()

    if uploaded is None:
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    delete_version(db, version_id)

    return {
        "message": "Version deleted."
    }