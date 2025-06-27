# apps/backend/app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from ..deps import get_db
from app.db.models import Student, Consultant
from app.core.auth import verify, create_token, hash_pwd

router = APIRouter(tags=["auth"])

class LoginIn(BaseModel):
    email: str
    password: str

class LoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SignupIn(BaseModel):
    name: str
    email: str
    password: str
    registration_id: str
    user_id: int

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

@router.post("/users", status_code=201)
def signup(data: SignupIn, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.exec(select(Student).where(Student.email == data.email)).first()
    if existing_user:
        raise HTTPException(409, "Email already registered")
    
    # Check if user_id already exists
    existing_user_id = db.exec(select(Student).where(Student.user_id == data.user_id)).first()
    if existing_user_id:
        raise HTTPException(409, "User ID already exists")
    
    # Create new student
    hashed_password = hash_pwd(data.password)
    new_student = Student(
        name=data.name,
        email=data.email,
        password_hash=hashed_password,
        registration_id=data.registration_id,
        user_id=data.user_id,
        paid=False
    )
    
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    return {"message": "User created successfully", "user_id": new_student.id}
