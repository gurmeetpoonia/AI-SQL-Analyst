from pydantic import BaseModel,EmailStr,Field, field_validator
import re 


class RegisterRequest(BaseModel):
    name:str
    email: EmailStr
    password: str=Field(
        min_length=8,
        max_length=64,
    )
    @field_validator("password")
    @classmethod
    def validate(cls, password):
        pattern=(
            r"^(?=.*[a-z])"
            r"(?=.*[A-Z])"
            r"(?=.*\d)"
            r"(?=.*[@$!%*?&])"
            r"[A-Za-z\d@$!%*?&]{8,64}$"
        )
        if not re.match(pattern,password):
            raise ValueError(
                "Password must contain at least one uppercase letter, on lowercase letter, one number, one special character and be 8-64 characters long."
            )
        return password


class LoginRequest(BaseModel):
    email:EmailStr
    password:str

class VerifyOTPRequest(BaseModel):
    email:EmailStr
    otp:str=Field(min_length=6,max_length=6)
    
class LoginResponse(BaseModel):
    access_token:str
    token_type:str

class ResendOTPRequest(BaseModel):
    email:EmailStr