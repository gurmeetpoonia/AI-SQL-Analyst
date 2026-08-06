from sqlalchemy.orm import Session
from app.models import PendingUser

def get_pending_user_by_email(db:Session,email:str):
    return db.query(PendingUser).filter(PendingUser.email==email).first()


def delete_pending_user(
        db:Session,pending_user:PendingUser
):
    db.delete(pending_user)
    return pending_user


def create_pending_user(
    db: Session,
    name: str,
    email: str,
    password: str
):
    pending_user = PendingUser(
        name=name,
        email=email,
        password=password
    )

    db.add(pending_user)

    return pending_user

def delete_pending_user_by_email(db: Session, email: str):
    db.query(PendingUser).filter(PendingUser.email == email).delete()