from datetime import datetime

from sqlalchemy.orm import Session
import json

from app.aiEditor.model.edit_history import EditHistory
from app.models import OTPVerification
from app.auth.services.otp_utils import generate_otp, get_expiry_time


def get_otp_by_email(
    db: Session,
    email: str,
    purpose:str,

):
    otp_record= (
        db.query(OTPVerification)
        .filter(
            OTPVerification.email == email,
            OTPVerification.purpose == purpose,
            OTPVerification.is_used == False

        )
        .order_by(OTPVerification.created_at.desc())
        .first()
    )
    print("DB OTP :", otp_record)

    return otp_record

def create_otp(
    db: Session,
    email: str,
    purpose:str
):
    delete_otp_by_email(
    db=db,
    email=email,
    purpose=purpose
)

    otp = generate_otp()
    expiry = get_expiry_time()

    otp_record = OTPVerification(
        email=email,
        otp=otp,
        purpose=purpose,
        expires_at=expiry
    )

    db.add(otp_record)

    return otp_record

def delete_otp_by_email(
    db: Session,
    email: str,
    purpose:str
):
    db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.purpose==purpose

    ).delete()  

def debug_all_otps(db: Session):
    records = db.query(OTPVerification).all()

    for record in records:
        print(
            record.email,
            record.otp,
            record.purpose,
            record.is_used,
            record.expires_at
        )     




def save_history(

    db,

    user_id,

    table_name,

    action,

    sql,

    backup_rows

):

    history=EditHistory(

        user_id=user_id,

        table_name=table_name,

        action=action,

        sql=sql,

        backup_json=json.dumps(backup_rows)

    )

    db.add(history)

    db.commit()

    db.refresh(history)

    return history       