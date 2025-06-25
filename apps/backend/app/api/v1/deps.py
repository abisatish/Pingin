from pathlib import Path
from sqlmodel import Session, create_engine
import os
from fastapi import Header, HTTPException
from jose import JWTError
from ...core.auth import decode_token

engine = create_engine(os.getenv("DATABASE_URL"), echo=True)

def get_db():
    with Session(engine) as session:
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