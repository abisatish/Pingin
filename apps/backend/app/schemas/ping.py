from pydantic import BaseModel
from typing import Optional

class PingCreate(BaseModel):
    student_id: int          # Foreign-key to User
    college: str
    question: str
    consultant_id: Optional[int] = None  # filled by matching later
