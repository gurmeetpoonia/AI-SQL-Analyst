from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.jwt import verify_access_token
from app.auth.crud.user_crud import get_user_by_email

oauth2_scheme= OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
        token:str =Depends(oauth2_scheme),db:Session=Depends(get_db)):
        payload= verify_access_token(token)

        if payload is None:
                raise HTTPException(
                        status_code=401, detail="Invalid or expired token."
                )
        email=payload.get("sub")
        user=get_user_by_email(db=db,email=email)

        if user is None:
                raise HTTPException(status_code=401,detail="User not found.")

        return user

