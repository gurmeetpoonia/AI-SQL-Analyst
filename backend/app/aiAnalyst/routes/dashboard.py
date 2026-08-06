from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User

from app.aiAnalyst.services.dashboard_service import (
    get_dashboard_statistics_service,
    get_recent_queries,
    get_current_dataset_service
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return get_dashboard_statistics_service(
        db=db,
        current_user=current_user
    )

@router.get("/recent-queries")
def recent_queries(
    current_user:User = Depends(get_current_user),
    db:Session=Depends(get_db)
):
    return get_recent_queries(
        db=db,
        current_user=current_user
    )


@router.get("/current-dataset")
def current_dataset(
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
):
    return get_current_dataset_service(
        db,
        current_user
    )