from pydantic import BaseModel

class SQLQueryRequest(BaseModel):
    question: str
    table_name:str