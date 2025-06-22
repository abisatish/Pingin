from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from .deps import get_db
from ...db.models import Ping
from .endpoints import pings      # new import



router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "ok"}

@router.get("/pings")
async def list_pings(db: Session = Depends(get_db)):
    return db.exec(select(Ping)).all()

api_router = router          # ← add this alias
router.include_router(pings.router)
