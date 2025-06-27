from pathlib import Path
from sqlmodel import Session, create_engine
import os
from fastapi import Header, HTTPException
from jose import JWTError
from ...core.auth import decode_token
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create engine lazily
_engine = None

def get_engine():
    global _engine
    if _engine is None:
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is not set")
        _engine = create_engine(database_url, echo=True)
    return _engine

def get_db():
    with Session(get_engine()) as session:
        yield session


def get_current_role(authorization: str = Header(...)):
    """Extract Bearer JWT → returns 'student' | 'consultant'."""
    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        print("payload printing:", payload)
        return payload["role"]
    except (ValueError, JWTError, KeyError):
        raise HTTPException(401, "Invalid token")