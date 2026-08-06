from sqlalchemy import Column, Integer, Float,String,DateTime,Text, Boolean,ForeignKey,JSON
from datetime import datetime
from sqlalchemy.orm import relationship


from app.database import Base

class UploadedFile(Base):
    __tablename__ ="uploaded_files"

    id= Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    file_name =Column(String,nullable=False)
    table_name=Column(String,unique=True,nullable=False)
    rows=Column(Integer,nullable=False)
    columns=Column(JSON,nullable=False)

    upload_time=Column(DateTime,default=datetime.utcnow)
    owner=relationship("User",back_populates="uploaded_files")


class QueryHistory (Base):
    __tablename__ ="query_history"
    id =Column(Integer,primary_key=True,index=True)
    question=Column(Text,nullable=False)
    sql_query=Column(Text,nullable=False)
    table_name=Column(String,nullable=True)
    result= Column(JSON,nullable=False)
    status=Column(String,nullable=False)
    execution_time = Column(Float, nullable=True)
    user_id=Column(Integer,ForeignKey("users.id"),nullable=False)
    created_at=Column(DateTime,default=datetime.utcnow)
    owner= relationship("User",back_populates="query_history")

class User(Base):
    __tablename__="users" 
    id=Column(Integer, primary_key=True,index=True)
    name = Column(String, nullable=False) 
    email=Column(String,unique=True,nullable=False,index=True)
    password=Column(String,nullable=False)
    is_verified=Column(String,default="False")
    created_at=Column(DateTime,default=datetime.utcnow)
    uploaded_files=relationship("UploadedFile",back_populates="owner")
    query_history=relationship("QueryHistory",back_populates="owner")

class OTPVerification(Base):
    __tablename__="otp_verifications"  
    id=Column(Integer,primary_key=True,index=True)
    email=Column(String,nullable=False,index=True)
    otp=Column(String(6),nullable=False)
    purpose=Column(String,nullable=False)
    is_used=Column(Boolean,default=False)
    expires_at=Column(DateTime,nullable=False)
    created_at=Column(DateTime,default=datetime.utcnow)

class PasswordResetToken(Base):
    __tablename__ ="password_reset_tokens"
    id=Column(Integer,primary_key=True,index=True)
    email=Column(String,nullable=True,index=True)
    token=Column(String,nullable=False, unique=True)
    expires_at=Column(DateTime,nullable=False)
    is_used =Column(Boolean,default=False)
    created_at=Column(DateTime,default=datetime.utcnow)

class PendingUser(Base):
    __tablename__="pending_users"
    id=Column(Integer,primary_key=True,index=True)
    name = Column(String, nullable=False)
    email=Column(String,unique=True,nullable=False,index=True)
    password=Column(String,nullable=False)
    created_at=Column(DateTime,default=datetime.utcnow)