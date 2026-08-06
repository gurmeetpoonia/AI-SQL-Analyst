from sqlalchemy import Column,Integer,String,Text,DateTime,ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class EditHistory(Base):

    __tablename__="edit_history"

    id=Column(Integer,primary_key=True)

    user_id=Column(
        Integer,
        ForeignKey("users.id")
    )

    table_name=Column(String)

    action=Column(String)

    sql=Column(Text)

    backup_json=Column(Text)

    created_at=Column(
        DateTime(timezone=True),
        server_default=func.now()
    )