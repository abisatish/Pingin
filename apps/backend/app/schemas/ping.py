from pydantic import BaseModel

class PingCreate(BaseModel):
    application_id: int
    student_id: int
    question: str
