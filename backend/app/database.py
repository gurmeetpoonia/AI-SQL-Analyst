from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os 
from dotenv import load_dotenv

load_dotenv()
Database_URL = os.getenv("DATABASE_URL")
engine = create_engine(
    Database_URL,
    pool_pre_ping=True,   # Har query se pehle connection test karega, agar drop ho chuka hai toh reconnection karega
    pool_recycle=300,     # Har 5 minute (300 sec) me stale connections drop/refresh karega
    pool_size=10,         # Maximum open connections
    max_overflow=20
)
SessionLocal=sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)

Base=declarative_base()

def get_db():
    db=SessionLocal()

    try:
        yield db

    finally:
        db.close()    