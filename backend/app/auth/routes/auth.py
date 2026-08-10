from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.schemas.auth_schemas import (
    RegisterRequest,
    VerifyOTPRequest,
    LoginRequest,
    ResendOTPRequest
)

from app.auth.services.auth_service import (
    register_user,
    verify_otp_user,
    login_user,
    resend_otp_user
)

from app.auth.dependencies import get_current_user
from app.auth.services.email_service import send_error_notification

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    return register_user(
        db=db,
        request=request
    )


@router.post("/verify-otp")
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    return verify_otp_user(
        request=request,
        db=db
    )


@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    return login_user(
        db=db,
        request=request
    )


@router.post("/resend-otp")
def resend_otp(
    request: ResendOTPRequest,
    db: Session = Depends(get_db)
):
    return resend_otp_user(
        db=db,
        request=request
    )


@router.get("/me")
def get_me(
    current_user = Depends(get_current_user)
):
    return {
        "success": True,
        "message": "User fetched successfully.",
        "data": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }

@router.get("/test-error-email")
def test_error_email():
    try:
        raise Exception("Test backend error")
    except Exception as e:
        send_error_notification(e)

        return {
            "success": True,
            "message": "Error notification sent"
        }