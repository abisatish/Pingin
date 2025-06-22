from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from ..deps import get_db
from app.db.models import Ping
from pydantic import BaseModel

router = APIRouter()

# GET endpoint to list pings
@router.get("/pings")
async def list_pings(db: Session = Depends(get_db)):
    return db.exec(select(Ping)).all()

# 🔧 Pydantic model for incoming POST request
class PingCreate(BaseModel):
    student_id: int
    college: str
    question: str

# POST endpoint to create a ping
@router.post("/pings")
async def create_ping(payload: PingCreate, db: Session = Depends(get_db)):
    ping = Ping.model_validate(payload)
    db.add(ping)
    db.commit()
    db.refresh(ping)
    return ping
