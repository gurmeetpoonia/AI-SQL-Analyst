from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.database import engine
from app import models 

from app.upload.routes import upload
from app.aiAnalyst.routes import sql 
from app.auth.routes import auth
from app.auth.routes import password
from app.aiAnalyst.routes import dashboard
from app.aiAnalyst.routes import history
from app.auth.routes import email_notification
from app.aiEditor.routes import dataset_editor

models.Base.metadata.create_all(bind=engine)

app=FastAPI(title="AI SQL Analyst",version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "AI SQL Analyst Backend Running Successfully 🚀"
    }

app.include_router(sql.router)
app.include_router(upload.router)
app.include_router(auth.router)
app.include_router(password.router)
app.include_router(dashboard.router)
app.include_router(history.router)
app.include_router(dataset_editor.router)
app.include_router(email_notification.router)
 