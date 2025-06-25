from datetime import datetime
from sqlmodel import SQLModel
from typing import Optional

class CommentCreate(SQLModel):
    anchor_start: int
    anchor_end:   int
    body:         str

class CommentRead(CommentCreate):
    id:       int
    author_id:int
    resolved: bool
    created_at: datetime