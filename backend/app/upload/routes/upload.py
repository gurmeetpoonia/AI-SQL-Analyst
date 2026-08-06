from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db, engine
from app.models import User
from app.auth.dependencies import get_current_user

from app.upload.services.upload_service import (
    upload_csv_service,
    get_uploaded_files_service,
    get_dataset_service,
)

from app.upload.services.delete_upload_file_service import (
    delete_uploaded_file_service,
)

from app.aiEditor.services.create_blank_dataset_service import (
    create_blank_dataset_service,
)

from app.aiEditor.schemas.data_editor_schema import CreateBlankDatasetRequest

router = APIRouter(
    prefix="/upload",
    tags=["Upload"],
)


# ----------------------------
# Test Route
# ----------------------------
@router.get("/")
def home():
    return {
        "message": "Upload Route Working"
    }


# ----------------------------
# Upload CSV
# ----------------------------
@router.post("/csv")
def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return upload_csv_service(
        file=file,
        db=db,
        current_user=current_user,
    )


# ----------------------------
# Get All Uploaded Files
# ----------------------------
@router.get("/files")
def get_uploaded_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_uploaded_files_service(
        db=db,
        current_user=current_user,
    )


# ----------------------------
# Delete Dataset
# ----------------------------
@router.delete("/{file_id}")
def delete_dataset(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return delete_uploaded_file_service(
        file_id=file_id,
        db=db,
        current_user=current_user,
    )


# ----------------------------
# Get Single Dataset
# ----------------------------
@router.get("/file/{file_id}")
def get_dataset(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_dataset_service(
        file_id=file_id,
        db=db,
        current_user=current_user,
    )


# ----------------------------
# Create Blank Dataset (naya khali table banao, bina CSV upload kiye)
# ----------------------------
@router.post("/create-blank")
def create_blank_dataset(
    request: CreateBlankDatasetRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_blank_dataset_service(
        request=request,
        current_user=current_user,
        db=db,
        engine=engine
    )