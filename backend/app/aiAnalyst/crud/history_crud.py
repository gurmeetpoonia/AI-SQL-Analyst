from sqlalchemy.orm import Session

from app.models import QueryHistory

def create_query_history(
    db: Session,
    question: str,
    sql_query: str,
    table_name:str,
    result,
    status: str,
     execution_time: float,
    user_id: int
):
    history = QueryHistory(
    question=question,
    sql_query=sql_query,
    status=status,
    table_name=table_name,
    result=result,

    execution_time=execution_time,
    user_id=user_id
)  
    db.add(history)

    return history


def get_query_history_by_user(
    db: Session,
    user_id: int
):
    return (
        db.query(QueryHistory)
        .filter(QueryHistory.user_id == user_id)
        .order_by(QueryHistory.created_at.desc())
        .all()
    )