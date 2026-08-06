from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import traceback
from app.auth.hashing import hash_password
from app.auth.schemas.forget_password_schema import ForgotPasswordRequest, VerifyResetOTPRequest, ResetPasswordRequest
from app.auth.crud.user_crud import get_user_by_email, update_user_password
from app.auth.crud.otp_crud import create_otp
from app.auth.services.email_service import send_otp_email
from app.auth.services.otp_service import verify_otp
from app.auth.services.token_service import (
    generate_reset_token,
    get_reset_token_expiry
)

from app.auth.crud.password_reset_token_crud import (
    create_password_reset_token,
    get_password_reset_token,
    delete_password_reset_token
)
from datetime import datetime

def forget_password_user(
    db:Session,
    request:ForgotPasswordRequest
):
    try:
        user=get_user_by_email(
            db=db, 
            email=request.email 
        )
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Email not registered."
            )
        otp_record=create_otp(db=db,email=request.email, purpose="RESET_PASSWORD")

        send_otp_email(email=request.email,otp=otp_record.otp)
        db.commit()
        return{
            "message": "OTP sent successfully.",
            "email": request.email
        }
    
    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()  
        raise HTTPException(
            status_code=500,
            detail="Database error occurred."
        )  

    except Exception:
        db.rollback()   
        raise HTTPException(
            status_code=500,
            detail="Failed to send OTP."
        ) 
    
def verify_reset_otp(
    db:Session,
    request : VerifyResetOTPRequest

):

    try:
        user=get_user_by_email(db=db, email=request.email)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Email not registered."
            )

        verify_otp(db=db,email=request.email,otp=request.otp, purpose="RESET_PASSWORD")


        
        reset_token = generate_reset_token()
        expiry=get_reset_token_expiry()
        create_password_reset_token(
            db=db,
            email=request.email,
            token=reset_token,
            expires_at=expiry
        )
        db.commit ()
        return {
    "message": "OTP verified successfully.",
    "reset_token": reset_token
}

    except HTTPException:
        raise 

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Database error occurred."
        ) 

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="OTP verification failed."
        )       


def reset_password_user(
    db:Session,
    request:ResetPasswordRequest
):

    try:
        user=get_user_by_email(
            db=db,email=request.email
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Email not registered."
            )

        token_record=get_password_reset_token(
            db=db,
            email=request.email,
            token=request.reset_token
        ) 

        if not token_record:
            raise HTTPException(
              status_code=400,
              detail="Invalid reset token."
            )  
        
        if token_record.email != request.email:
            raise HTTPException(
                status_code=404,
                detail="Invalid token."
            )
        if token_record.expires_at < datetime.utcnow():
            delete_password_reset_token(db=db,token_record=token_record)
            raise HTTPException(status_code=400,
            detiall="Reset token expired.")

        hashed_password=hash_password(request.new_password)   

        update_user_password(db=db,user=user,hashed_password=hashed_password) 

        token_record.is_used=True 

        delete_password_reset_token(db=db,token_record=token_record)
        db.commit()

        return{
            "message": "Password reset successfully."
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Database error occurred."
        )

    except Exception as e:
       
        traceback.print_exc()

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

def resend_reset_otp(
    db: Session,
    request: ForgotPasswordRequest
):
    try:

        user = get_user_by_email(
            db=db,
            email=request.email
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Email not registered."
            )

        otp_record = create_otp(
            db=db,
            email=request.email,
            purpose="RESET_PASSWORD"
        )

        send_otp_email(
            email=request.email,
            otp=otp_record.otp
        )

        db.commit()

        return {
            "message": "OTP resent successfully."
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Database error occurred."
        )

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to resend OTP."
        )           