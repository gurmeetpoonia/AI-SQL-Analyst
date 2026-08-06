import json

from sqlalchemy import text

from app.aiEditor.model.datasetVersion import DatasetVersion


def create_snapshot(
    engine,
    table_name
):

    with engine.connect() as conn:

        result = conn.execute(
            text(f'SELECT * FROM "{table_name}"')
        )

        rows = [dict(r._mapping) for r in result]

    return json.dumps(rows)


def save_version(
    db,
    uploaded_file_id,
    snapshot_json,
    edit_prompt,
    ai_summary,
    sql_executed,
    rows_changed=None,
    columns_affected=None,
    execution_time=None,
    status="success"
):

    last = db.query(DatasetVersion).filter(
        DatasetVersion.uploaded_file_id == uploaded_file_id
    ).order_by(
        DatasetVersion.version.desc()
    ).first()

    version = 1 if last is None else last.version + 1

    # Backup ID version number se auto-generate hota hai, jaise "v_0005"
    backup_id = f"v_{str(version).zfill(4)}"

    obj = DatasetVersion(
        uploaded_file_id=uploaded_file_id,
        version=version,
        snapshot_json=snapshot_json,
        edit_prompt=edit_prompt,
        ai_summary=ai_summary,
        sql_executed=sql_executed,
        rows_changed=rows_changed,
        columns_affected=columns_affected,
        execution_time=execution_time,
        backup_id=backup_id,
        status=status
    )

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj


def rename_version(db, version_id, new_name):
    version = db.query(DatasetVersion).filter(
        DatasetVersion.id == version_id
    ).first()

    if version is None:
        return None

    version.custom_name = new_name
    db.commit()
    db.refresh(version)
    return version


def delete_version(db, version_id):
    version = db.query(DatasetVersion).filter(
        DatasetVersion.id == version_id
    ).first()

    if version is None:
        return None

    db.delete(version)
    db.commit()
    return version