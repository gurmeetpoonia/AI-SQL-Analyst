from fastapi import APIRouter,Depends

from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user
from app.models import User
from app.database import get_db,engine
from app.aiEditor.services.dataset_editor_sql import generate_edit_plan_service,execute_edit_service,preview_edit_service
from app.aiEditor.schemas.data_editor_schema import DatasetEditRequest,UndoRequest,RestoreVersionRequest,ExecutePlanRequest,RenameVersionRequest
from app.aiEditor.services.dataset_editor_service import undo_last_edit,restore_version,version_history, rename_version_service, delete_version_service 



import logging 

logger= logging.getLogger(__name__)
router=APIRouter(prefix="/editor",tags=["Editor"])


@router.post("/edit-plan")
def dataset_edit_plan(
    request: DatasetEditRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return generate_edit_plan_service(
        request=request,
        current_user=current_user,
        db=db
    )   

@router.post("/execute-edit")
def execute_edit(
    request: ExecutePlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)     # <-- ye missing tha, add karo
):
    return execute_edit_service(
        plan=request.plan,
        current_user=current_user,
        db=db,
        user_request=getattr(request, "question", None) or "AI Dataset Edit"
    )

@router.post("/preview-edit")
def preview_edit(
    plan: dict,
    current_user: User = Depends(get_current_user)
):

    return preview_edit_service(
        plan,
        current_user
    )













@router.patch("/rename-version/{version_id}")
def rename_version_route(
    version_id: int,
    request: RenameVersionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return rename_version_service(
        db=db,
        version_id=version_id,
        new_name=request.custom_name,
        current_user=current_user
    )


@router.delete("/versions/{version_id}")
def delete_version_route(
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return delete_version_service(
        db=db,
        version_id=version_id,
        current_user=current_user
    )

@router.post("/restore-version")

def restore(

    request:RestoreVersionRequest,

    db:Session=Depends(get_db),

    current_user:User=Depends(get_current_user)

):

    return restore_version(

        db=db,

        engine=engine,

        version_id=request.version_id,
        
        current_user=current_user

    )




@router.get("/versions/{uploaded_file_id}")

def versions(

    uploaded_file_id:int,

    db:Session=Depends(get_db),

    current_user:User=Depends(get_current_user)

):

    return version_history(
    db=db,
    uploaded_file_id=uploaded_file_id,
    current_user=current_user
)


@router.post("/undo")
def undo(
    request: UndoRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return undo_last_edit(
        db=db,
        engine=engine,
        current_user=current_user,
        table_name=request.table_name
    )