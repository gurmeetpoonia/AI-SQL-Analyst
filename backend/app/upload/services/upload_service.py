import os
import shutil
import uuid
from sqlalchemy import text
import pandas as pd

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.models import User
from app.database import engine
from app.upload.crud.upload_crud import create_uploaded_file, get_uploaded_file_by_name,get_uploaded_files_by_user,get_uploaded_file_by_id,delete_uploaded_file
from app.upload.utils.helper import gerenate_table_name,get_unique_table_name

def upload_csv_service(
    file: UploadFile,
    db: Session,
    current_user: User
):
    
    extension = file.filename.split(".")[-1].lower()

    allowed_extensions = ["csv", "xlsx", "xls"]

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are allowed."
        )

    
    existing_file = get_uploaded_file_by_name(
    db=db,
    user_id=current_user.id,
    file_name=file.filename
)

    if existing_file:
        raise HTTPException(
            status_code=400,
            detail="This dataset is already uploaded."
        )
    
    upload_dir = "uploads"

    os.makedirs(upload_dir, exist_ok=True)

    unique_name = f"{uuid.uuid4()}_{file.filename}"

    file_path = os.path.join(upload_dir, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    table_name = gerenate_table_name(file.filename)
    table_name = get_unique_table_name(
    engine,
    table_name
)
    try:

        if extension == "csv":
            df = pd.read_csv(file_path)

        else:   # xlsx or xls
            df = pd.read_excel(file_path)

    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=400,
            detail="Dataset is empty."
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
    df.to_sql(
    name=table_name,
    con=engine,
    if_exists="replace",
    index=False
)
    
    create_uploaded_file(
        db=db,
        file_name=file.filename,
        table_name=table_name,
        rows=len(df),
        columns=df.columns.tolist(),
        user_id=current_user.id
    )

    return {
    "message": "File uploaded successfully",
    "filename": file.filename,
    "table_name": table_name,
    "rows": len(df),
    "columns": list(df.columns)
}


def get_uploaded_files_service(
   db:Session,
   current_user:User
):
    files= get_uploaded_files_by_user(
        db=db,
        user_id=current_user.id
    )

    return{
        "success":True,
        "message": "Uploaded files fetched successfully.",
        "data": [

        {

            "id": file.id,

            "filename": file.file_name,

            "table_name": file.table_name,

            "rows": file.rows,

            "columns": file.columns,

            "upload_time": file.upload_time

        }

        for file in files

    ]
    }

def delete_uploaded_file_service(
    file_id: int,
    db: Session,
    current_user: User
):
    uploaded_file = get_uploaded_file_by_id(
        db=db,
        file_id=file_id,
        user_id=current_user.id
    )

    if not uploaded_file:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found."
        )

    with engine.begin() as conn:
        conn.execute(
            text(
                f'DROP TABLE IF EXISTS "{uploaded_file.table_name}"'
            )
        )

    delete_uploaded_file(
        db=db,
        uploaded_file=uploaded_file
    )

    db.commit()

    return {
        "success": True,
        "message": "Dataset deleted successfully."
    }


def get_dataset_service(
    file_id: int,
    db: Session ,
    current_user: User
):
    uploaded = get_uploaded_file_by_id(
        db=db,
        file_id=file_id,
        user_id=current_user.id
    )

    if uploaded is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found."
        )

    with engine.connect() as conn:

        result = conn.execute(
            text(f'SELECT * FROM "{uploaded.table_name}"')
        )

        rows = [
            dict(row._mapping)
            for row in result
        ]

    return {
        "id": uploaded.id,
        "file_name": uploaded.file_name,
        "table_name": uploaded.table_name,
        "rows_count": uploaded.rows,
   
        "columns": uploaded.columns,
             "rows": rows
    }
  