from typing import Optional
from sqlmodel import SQLModel

class StudentRead(SQLModel):
    id: int
    registration_id: str
    user_id: int
    highschool_id: Optional[int] = None
    photo_url: Optional[str] = None
    paid: bool