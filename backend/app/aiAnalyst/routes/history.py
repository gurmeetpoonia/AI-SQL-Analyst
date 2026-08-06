from fastapi import APIRouter, Depends
from app.models import User
from app.database import get_db
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user
from app.aiAnalyst.services.history_service import get_recent_history_service
router = APIRouter(
    prefix="/history",
    tags=["History"]
)

@router.get("/recent")
def get_recent_queries(

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    return get_recent_history_service(

        db=db,

        current_user=current_user

    )
    