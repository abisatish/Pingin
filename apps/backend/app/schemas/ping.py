from pydantic import BaseModel

class PingCreate(BaseModel):
    application_id: int
    question: str
    consultant_id: int | None = None
    essay_id: int | None = None
