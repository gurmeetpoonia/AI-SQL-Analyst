from pydantic import BaseModel

class EditRequest(BaseModel):
    request: str
    table_name: str


class EditPlan(BaseModel):
    action: str
    table_name: str
    explanation: str
    confidence: float
    requires_confirmation: bool
    risk_level: str