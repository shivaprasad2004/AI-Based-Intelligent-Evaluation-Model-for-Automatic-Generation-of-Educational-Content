import os
import secrets
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY') or secrets.token_hex(32)
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') or secrets.token_hex(32)

    if not os.getenv('SECRET_KEY'):
        print("WARNING: SECRET_KEY not set in .env, using auto-generated key. Set it for production.")
    if not os.getenv('JWT_SECRET_KEY'):
        print("WARNING: JWT_SECRET_KEY not set in .env, using auto-generated key. Set it for production.")
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    AI_PROVIDER = os.getenv('AI_PROVIDER', 'gemini')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
