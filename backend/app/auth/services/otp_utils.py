import secrets
from datetime import datetime, timedelta


def generate_otp():
    return str(secrets.randbelow(900000) + 100000)


def get_expiry_time():
    return datetime.utcnow() + timedelta(minutes=5)