from sqlalchemy.orm import Session
from app.models import UploadedFile , QueryHistory

def create_uploaded_file(
    db: Session,
    file_name: str,
    table_name: str,
    rows:int,
    columns:list,
    user_id: int) -> UploadedFile:

    db_file = UploadedFile(
        file_name=file_name,
        table_name=table_name,
        rows=rows,
        columns=columns,
        user_id=user_id
    )

    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return db_file


def get_uploaded_files_by_user(db:Session,user_id:int):
    return (db.query(UploadedFile).filter(UploadedFile.user_id==user_id).order_by(UploadedFile.upload_time.desc())
    .all())

def get_uploaded_file_by_id(
    db: Session,
    file_id: int,
    user_id: int
):
    return (
        db.query(UploadedFile)
        .filter(
            UploadedFile.id == file_id,
            UploadedFile.user_id == user_id
        )
        .first()
    )

def delete_uploaded_file(
    db:Session,
    uploaded_file:UploadedFile
):
    db.delete(uploaded_file)


def get_query_history_by_user(
    db:Session,
    user_id: int):
    return (
        db.query(QueryHistory).filter(
            QueryHistory.user_id==user_id
        ).order_by(QueryHistory.created_at.desc()).all()
    )


def get_uploaded_file_by_name(
    db: Session,
    user_id: int,
    file_name: str
):
    return (
        db.query(UploadedFile)
        .filter(
            UploadedFile.user_id == user_id,
            UploadedFile.file_name == file_name
        )
        .first()
    )

def delete_query_history_by_table_name(
    db: Session,
    table_name: str
):
    db.query(QueryHistory).filter(
        QueryHistory.table_name == table_name
    ).delete()


def get_uploaded_file_by_table_name(
    db,
    table_name,
    user_id
):
    return (
        db.query(UploadedFile)
        .filter(
            UploadedFile.table_name == table_name,
            UploadedFile.user_id == user_id
        )
        .first()
    )   
