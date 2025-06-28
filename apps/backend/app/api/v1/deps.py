from pathlib import Path
from sqlmodel import Session, create_engine, select
import os
from fastapi import Header, HTTPException, Depends
from jose import JWTError
from ...core.auth import decode_token
from ...db.models import Student, Consultant
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

def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
) -> Student:
    """Extract Bearer JWT → returns the authenticated student user."""
    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        user_id = int(payload["sub"])
        role = payload["role"]
        
        if role != "student":
            raise HTTPException(403, "Only students can access this endpoint")
        
        student = db.get(Student, user_id)
        if not student:
            raise HTTPException(404, "Student not found")
        
        return student
    except (ValueError, JWTError, KeyError):
        raise HTTPException(401, "Invalid token")

def get_current_consultant(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
) -> Consultant:
    """Extract Bearer JWT → returns the authenticated consultant user."""
    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        user_id = int(payload["sub"])
        role = payload["role"]
        
        if role != "consultant":
            raise HTTPException(403, "Only consultants can access this endpoint")
        
        consultant = db.get(Consultant, user_id)
        if not consultant:
            raise HTTPException(404, "Consultant not found")
        
        return consultant
    except (ValueError, JWTError, KeyError):
        raise HTTPException(401, "Invalid token")