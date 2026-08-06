from sqlalchemy.orm import Session

from app.models import User
from app.aiAnalyst.crud.history_crud import get_query_history_by_user

from app.utils.json_safe import sanitize_json

def get_recent_history_service(
    db: Session,
    current_user: User
):
    history = get_query_history_by_user(
        db=db,
        user_id=current_user.id
    )

    data = []

    for item in history:

        data.append({
            "id": item.id,
            "question": item.question,
            "sql": item.sql_query,
            "table_name": item.table_name,
            "rows":sanitize_json(item.result),
            "status": item.status,
            "execution_time": item.execution_time,
            "created_at": item.created_at
        })

    return {
        "success": True,
        "message": "History fetched successfully.",
        "data": data
    }