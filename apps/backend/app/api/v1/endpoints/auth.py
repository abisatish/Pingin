# apps/backend/app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from ..deps import get_db
from app.db.models import Student, Consultant
from app.core.auth import verify, create_token

router = APIRouter(tags=["auth"])

class LoginIn(BaseModel):
    email: str
    password: str

class LoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/auth/login", response_model=LoginOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    # try student first
    user = db.exec(select(Student).where(Student.email == data.email)).first()
    role = "student"
    if not user:
        user = db.exec(select(Consultant).where(Consultant.email == data.email)).first()
        role = "consultant"
    if not user or not verify(data.password, user.password_hash):
        raise HTTPException(401, "Bad credentials")

    token = create_token({"sub": user.id, "role": role})
    print("The token is:", token)
    return {"access_token": token}
