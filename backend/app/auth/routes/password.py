from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.auth.schemas.forget_password_schema import (
    ForgotPasswordRequest,
    VerifyResetOTPRequest,
    ResetPasswordRequest   
)

from app.auth.services.password_service import (
    forget_password_user,
    verify_reset_otp,
    reset_password_user,
    resend_reset_otp
)

router=APIRouter( prefix="/password",
    tags=["Password"])

@router.post("/forgot-password")   
def forgot_password( 
    request:ForgotPasswordRequest,
    db:Session=Depends(get_db)
) :

    return forget_password_user(db=db,request=request)

@router.post("/verify-reset-otp")
def verify_reset_password_otp(
    request: VerifyResetOTPRequest,
    db: Session = Depends(get_db)
):
    return verify_reset_otp(
        db=db,
        request=request
    )    

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    return reset_password_user(
        db=db,
        request=request
    )    

@router.post("/resend-reset-otp")
def resend_reset_otp_route(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    return resend_reset_otp(
        db=db,
        request=request
    )    