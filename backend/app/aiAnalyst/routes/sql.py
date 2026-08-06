from fastapi import APIRouter,Depends
from app.aiAnalyst.services.gemini_service import test_gemini
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user
from app.models import User
from app.aiAnalyst.schemas.sql_schemas import SQLQueryRequest
from app.database import get_db
from app.aiAnalyst.services.sql_service import generate_sql_service,query_database_service
   # <-- naya
   
import logging 

logger= logging.getLogger(__name__)
router=APIRouter(prefix="/ai",tags=["AI"])
@router.get("/test")
def ai_test():
    response= test_gemini()
    return {
       "response": response
    }

@router.post("/generate-sql")
def generate_sql_endpoint(request:SQLQueryRequest,current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
    return generate_sql_service(
        request=request,
        current_user=current_user,
        db=db
        )



@router.post("/query")
def query_database(request:SQLQueryRequest ,
                  db:Session=Depends(get_db),current_user: User = Depends(get_current_user)):

    return query_database_service(
        request=request,
        current_user=current_user,
        db=db
        )


