from sqlalchemy.orm import Session

from app.models import PasswordResetToken


def create_password_reset_token(
    db: Session,
    email: str,
    token: str,
    expires_at
):
    token_record = PasswordResetToken(
        email=email,
        token=token,
        expires_at=expires_at
    )

    db.add(token_record)

    return token_record


def get_password_reset_token(
    db: Session,
    email:str,
    token: str
):
    return (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.email==email,
            PasswordResetToken.token == token,
            PasswordResetToken.is_used == False
        )
        .first()
    )


def delete_password_reset_token(
    db: Session,
    token_record: PasswordResetToken
):
    db.delete(token_record)

    return token_record