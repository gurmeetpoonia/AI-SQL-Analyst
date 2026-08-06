from datetime import datetime 
from app.auth.crud.otp_crud import debug_all_otps
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.auth.crud.otp_crud import (
    get_otp_by_email,
    delete_otp_by_email
)

def verify_otp(
    db: Session,
    email: str,
    otp: str,
    purpose :str
):
    debug_all_otps(db)
    print("EMAIL :", email)
    print("OTP :", otp)
    print("PURPOSE :", purpose)

    otp_record = get_otp_by_email(
        db=db,
        email=email,
        purpose=purpose
    )

    if not otp_record:
        raise HTTPException(
            status_code=404,
            detail="OTP not found."
        )

    if otp_record.is_used:
        raise HTTPException(
            status_code=400,
            detail="OTP has already been used."
        )

    if otp_record.expires_at < datetime.utcnow():
        delete_otp_by_email(
            db=db,
            email=email,
            purpose=purpose
        )

        raise HTTPException(
            status_code=400,
            detail="OTP has expired."
        )

    if otp_record.otp != otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    otp_record.is_used=True
    delete_otp_by_email(
        db=db,
        email=email,
        purpose=purpose
    )

    return True



