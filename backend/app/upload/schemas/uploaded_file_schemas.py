from pydantic import BaseModel
from datetime import datetime

class UploadedFileBase(BaseModel):
    file_name:str
    table_name: str

class UploadedFileResponse(UploadedFileBase):
    id:int 
    upload_time: datetime

    class Config:
        from_attributes=True   