from sqlalchemy.orm import Session
from app.models import UploadedFile , QueryHistory
from sqlalchemy import func
def get_total_uploaded_files(db:Session,
user_id: int):
    return (db.query(UploadedFile).filter(UploadedFile.user_id==user_id)
    .count())

def get_total_queries(
    db:Session,
    user_id:int
):
    return( db.query(QueryHistory).filter(QueryHistory.user_id==user_id).count())


def get_successful_queries(
    db:Session, user_id:int
):
    return (
        db.query(QueryHistory).filter(
            QueryHistory.user_id==user_id,
            QueryHistory.status== "SUCCESS"
        ).count()
    )

def get_failed_queries(
    db:Session,
    user_id:int
):
    return(
        db.query(QueryHistory)
        .filter(QueryHistory.user_id==user_id,
        QueryHistory.status== "FAILED"
        ).count()

    )

def get_recent_queries(
        db:Session,
        user_id:int,
        limit: int=10
):
    return(
        db.query(QueryHistory).filter(QueryHistory.user_id==user_id).order_by(
            QueryHistory.created_at.desc()
        )
        .limit(limit)
        .all()
    )



def get_latest_uploaded_file(
    db,
    user_id:int
):
    return (
        db.query(UploadedFile)
        .filter(
            UploadedFile.user_id == user_id
        )
        .order_by(
            UploadedFile.upload_time.desc()
        )
        .first()
    )

def average_execution_time(
        db:Session,
        user_id:int
):
    return(
        db.query(func.avg(QueryHistory.execution_time)).filter(QueryHistory.user_id==user_id)
        .scalar()
    )