import re
from sqlalchemy import text
from fastapi import HTTPException

from app.models import UploadedFile
from app.upload.crud.upload_crud import create_uploaded_file


ALLOWED_TYPES = {"TEXT", "INTEGER", "REAL", "BOOLEAN", "DATE"}


def sanitize_identifier(name: str) -> str:
    """
    Column/table name ko safe SQL identifier me convert karta hai.
    Spaces, special chars hata ke lowercase snake_case bana deta hai.
    """
    name = name.strip().lower()
    name = re.sub(r"[^a-z0-9_]", "_", name)
    name = re.sub(r"_+", "_", name).strip("_")
    if not name:
        name = "col"
    if name[0].isdigit():
        name = f"c_{name}"
    return name


def create_blank_dataset_service(request, current_user, db, engine):
    file_name = request.file_name.strip()
    if not file_name:
        raise HTTPException(
            status_code=400,
            detail="Dataset name is required."
        )

    if not request.columns or len(request.columns) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one column is required."
        )

    # Column names sanitize + validate karo
    seen = set()
    col_defs_sql = []
    column_names = []

    for col in request.columns:
        col_name = sanitize_identifier(col.name)
        if not col_name or col_name in seen:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid or duplicate column name: '{col.name}'"
            )
        seen.add(col_name)

        col_type = col.type.strip().upper()
        if col_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported column type: '{col.type}'"
            )

        col_defs_sql.append(f"{col_name} {col_type}")
        column_names.append(col_name)

    # Unique table_name generate karo (UploadedFile.table_name unique=True hai)
    base_table_name = sanitize_identifier(file_name)
    table_name = base_table_name
    suffix = 1
    while db.query(UploadedFile).filter(UploadedFile.table_name == table_name).first():
        suffix += 1
        table_name = f"{base_table_name}_{suffix}"

    # Asli SQL table banao
    create_sql = f"CREATE TABLE {table_name} ({', '.join(col_defs_sql)});"

    try:
        with engine.begin() as conn:
            conn.execute(text(create_sql))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create table: {str(e)}"
        )

    # UploadedFile record save karo (existing crud function reuse kiya)
    db_file = create_uploaded_file(
        db=db,
        file_name=file_name,
        table_name=table_name,
        rows=0,
        columns=column_names,
        user_id=current_user.id
    )

    return {
        "id": db_file.id,
        "file_name": db_file.file_name,
        "table_name": db_file.table_name,
        "rows": db_file.rows,
        "columns": db_file.columns
    }