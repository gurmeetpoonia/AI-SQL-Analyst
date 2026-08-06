from pydantic import BaseModel
from typing import List

class DatasetEditRequest(BaseModel):
    question: str
    table_name: str

    
class UndoRequest(BaseModel):
    table_name: str


class RestoreVersionRequest(BaseModel):

    version_id:int  


class ExecutePlanRequest(BaseModel):
    plan: dict  
    question: str | None=None



class ColumnDefinition(BaseModel):
    name: str
    type: str   # "TEXT" | "INTEGER" | "REAL" | "BOOLEAN" | "DATE"


class CreateBlankDatasetRequest(BaseModel):
    file_name: str
    columns: List[ColumnDefinition]

    
# Apni app/schemas/data_editor_schema.py me ye class add kar do
# (baaki existing classes ke sath)

from pydantic import BaseModel


class RenameVersionRequest(BaseModel):
    custom_name: str    