from fastapi import FastAPI, Request,APIRouter
from fastapi.responses import JSONResponse

from app.auth.services.email_service import send_error_notification
router = APIRouter(
    prefix="/error",
    tags=["error_notification"]
)

@router.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    try:
        send_error_notification(exc)
    except Exception as email_error:
        print(f"Failed to send error notification: {email_error}")

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error"
        }
    )