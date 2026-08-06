from datetime import datetime, timedelta, UTC
from jose import jwt, JWTError
from app.config import SECRET_KEY, ALGORITHM



def create_access_token(data:dict):
    expire=datetime.now(UTC)+timedelta(hours=24)
    payload=data.copy()
    payload.update(
        {
           "exp" : expire
        }
    )

    encoded_jwt=jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return encoded_jwt


def verify_access_token(token:str):
    try:
        decode_jwt=jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return decode_jwt

    except JWTError:
        return None
