from fastapi import  HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.auth.schemas.auth_schemas import RegisterRequest, VerifyOTPRequest, LoginRequest, ResendOTPRequest
from app.auth.hashing import verify_password
from app.auth.jwt import create_access_token
from app.auth.services.otp_service import verify_otp
from app.auth.crud.user_crud import (
    get_user_by_email,
    create_user
)
from app.auth.crud.pending_user_crud import (
    get_pending_user_by_email,
    create_pending_user,
    delete_pending_user,
    delete_pending_user_by_email

)
from app.auth.crud.otp_crud import create_otp
from app.auth.services.email_service import send_otp_email
from app.auth.hashing import hash_password




def register_user(
    db: Session,
    request: RegisterRequest
):
    try:
        existing_user = get_user_by_email(db=db, email=request.email)  
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered."
            )

        hashed_password = hash_password(request.password)

        delete_pending_user_by_email(db=db, email=request.email)
        otp_record = create_otp(db=db, email=request.email,purpose="REGISTER")
        create_pending_user(db=db,name=request.name, email=request.email, password=hashed_password)
        send_otp_email(email=request.email, otp=otp_record.otp)
        db.commit()

        return {
            "message": "OTP sent successfully.",
            "email": request.email
        }

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed. Try again.")

        
def verify_otp_user(
    request:VerifyOTPRequest,
    db:Session
):
    try:
        pending_user = get_pending_user_by_email(
    db=db,
    email=request.email
)
        if not pending_user:
            raise HTTPException(status_code=404,detail="Pending Registration not found.")

        verify_otp(db=db,email=request.email,otp=request.otp,purpose="REGISTER")
        new_user = create_user(
            db=db,
            name=pending_user.name,
            email=pending_user.email,
            password=pending_user.password
        )
        delete_pending_user(
            db=db,
            pending_user=pending_user
        )
        db.commit()  

        return {
            "message": "Registration completed successfully.",
            "email": new_user.email
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


def login_user(db:Session,request:LoginRequest):
    try:
        user=get_user_by_email(db=db,email=request.email)
        if not user:
            raise HTTPException(status_code=401,detail="Email not registered.")

        if not verify_password(request.password,user.password):
            raise HTTPException(status_code=401,detail="Invalid password.")

        access_token=create_access_token({
            "sub":user.email
        })

        return{
            "access_token": access_token,
            "token_type": "bearer"
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
            detail="Login failed."
        )


def resend_otp_user(
    db:Session,
    request:ResendOTPRequest
):
    try:
        pending_user= get_pending_user_by_email(
            db=db,
            email=request.email
        )
        if not pending_user:
            raise HTTPException(
                status_code=404,
                detail="Pending registration not found."
            )
        otp_record=create_otp(
            db=db,
            email=request.email,
            purpose="REGISTER"
        )

        send_otp_email(
            email=request.email,
            otp=otp_record.otp
        )

        db.commit()
        return{
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