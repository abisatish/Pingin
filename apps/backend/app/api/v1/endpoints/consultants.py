from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from ..deps import get_db
from app.db.models import Consultant

router = APIRouter(prefix="/consultants", tags=["consultants"])

@router.get("/{consultant_id}")
def get_consultant(consultant_id: int, db: Session = Depends(get_db)):
    consultant = db.get(Consultant, consultant_id)
    if not consultant:
        raise HTTPException(404, "Consultant not found")
    return {
        "id": consultant.id,
        "name": consultant.name,
        "email": consultant.email,
    }
