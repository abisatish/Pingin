from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select
from ..deps import get_db
from app.db.models import Ping
from app.schemas.ping import PingCreate

router = APIRouter(prefix="/pings", tags=["pings"])

# list
@router.get("/", response_model=list[Ping])
def list_pings(db: Session = Depends(get_db)):
    return db.exec(select(Ping)).all()

# create
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=Ping)
def create_ping(payload: PingCreate, db: Session = Depends(get_db)):
    ping = Ping(**payload.dict())
    db.add(ping)
    db.commit()
    db.refresh(ping)
    return ping
