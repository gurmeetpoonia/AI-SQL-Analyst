from fastapi import FastAPI 
from dotenv import load_dotenv
import os

load_dotenv()
GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

SECRET_KEY =os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
