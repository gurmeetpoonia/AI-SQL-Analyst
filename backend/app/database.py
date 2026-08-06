from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os 
from dotenv import load_dotenv

load_dotenv()
Database_URL = os.getenv("DATABASE_URL")
engine= create_engine(Database_URL)

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