from fastapi import HTTPException
from app.database import engine
from sqlalchemy import text 
from  sqlalchemy.orm import Session
from app.models import User
from app.upload.crud.upload_crud import get_uploaded_file_by_id, delete_uploaded_file,delete_query_history_by_table_name

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

    try:
        with engine.begin() as conn:
            conn.execute(
                text(f'DROP TABLE IF EXISTS "{uploaded_file.table_name}"')
            )
        delete_query_history_by_table_name(
    db=db,
    table_name=uploaded_file.table_name
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

    except Exception as e:
        db.rollback()
        print(e)   # Debug ke liye

        raise HTTPException(
            status_code=500,
            detail="Failed to delete dataset."
        )