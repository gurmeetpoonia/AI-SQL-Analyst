from fastapi import HTTPException

from app.aiAnalyst.crud.history_crud import create_query_history
from sqlalchemy.orm import Session
from app.database import engine 
from app.models import User
from app.aiAnalyst.schemas.sql_schemas import SQLQueryRequest
from app.aiAnalyst.services.database_service import execute_sql

from app.aiAnalyst.services.gemini_service import (
    generate_sql,
    fix_sql,
    get_database_schema
)



from app.aiEditor.schemas.response_schemas import APIResponse
import time 
import logging 

logger= logging.getLogger(__name__)
def generate_sql_service(request:SQLQueryRequest,current_user: User,db: Session):
    
    sql = generate_sql(
        db=db,
        engine=engine,
        question=request.question,
        table_name=request.table_name,
        current_user=current_user
    )
    return{"question": request.question,"sql":sql}

def query_database_service(request:SQLQueryRequest ,
                   db:Session,current_user: User):
    try:
        sql = generate_sql(
    db=db,
    engine=engine,
    question=request.question,
    table_name=request.table_name,
    current_user=current_user
)
        start = time.perf_counter()
        try:

            data = execute_sql(
                engine,
                sql
            )

        except Exception as sql_error:

            schema = get_database_schema(
                engine,
                [request.table_name]
            )

            sql = fix_sql(
                schema=schema,
                question=request.question,
                failed_sql=sql,
                error=str(sql_error)
            )

            data = execute_sql(
                engine,
                sql
            )
        end = time.perf_counter()

        execution_time = round(
            end - start,
            4
        )
        history=create_query_history(db=db,question=request.question,sql_query=sql, table_name=request.table_name,result=data,status="SUCCESS", execution_time=execution_time,user_id=current_user.id)
        db.commit()
        db.refresh(history)
        
        return APIResponse(
            success=True,
            message="Query executed successfully.",
            data={
                "question": request.question,
                "sql": sql,
                "rows": data
            }
        )
    except ValueError as e:
        raise HTTPException(
             status_code=400,
             detail=str(e)
        )

    except Exception as e:
        create_query_history(
            db=db,
            question=request.question,
            sql_query=sql if 'sql' in locals() else "",
            table_name=request.table_name,
            result=None,
            status="FAILED",
            execution_time=None,
            user_id=current_user.id
)
        
        logger.exception("Unexpected error while executing AI query")
        raise HTTPException( 
            status_code=500,
            detail=f"Internal Server Error: {str(e)}"
        )


