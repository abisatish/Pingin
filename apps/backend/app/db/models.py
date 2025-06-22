from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: str  # "student" | "consultant"
    email: str
    hashed_password: str
    profiles: List["Profile"] = Relationship(back_populates="user")

class Profile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    blob: str  # JSON string
    user: "User" = Relationship(back_populates="profiles")

class Ping(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    consultant_id: Optional[int] = Field(default=None, foreign_key="user.id")
    college: str
    question: str
    status: str = "open"
    created_at: datetime = Field(default_factory=datetime.utcnow)
