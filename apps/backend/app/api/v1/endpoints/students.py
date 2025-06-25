# app/api/v1/endpoints/students.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlmodel import Session, select

from app.db.models import Student, CollegeApplication
from ..deps import get_db
from app.schemas.student import StudentRead    # <-- lean DTO

router = APIRouter(prefix="/users", tags=["users"])


# ────────────────────────── Routes ────────────────────────── #

@router.get("", response_model=List[StudentRead])
def list_all_users(db: Session = Depends(get_db)):
    """Return **every** student row (paid + unpaid)."""
    return db.exec(select(Student)).all()


@router.get("/registered", response_model=List[StudentRead])
def list_paid_users(db: Session = Depends(get_db)):
    """Return students whose `paid` flag is **true**."""
    return db.exec(select(Student).where(Student.paid == True)).all()  # noqa: E712


@router.get(
    "/by-consultant/{consultant_id}",
    response_model=List[StudentRead],
)
def users_for_consultant(
    consultant_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    """
    List students that have **at least one** college-application
    assigned to the given consultant.
    """
    stmt = (
        select(Student)
        .join(
            CollegeApplication,
            CollegeApplication.student_id == Student.id,
        )
        .where(CollegeApplication.consultant_id == consultant_id)
        .distinct()
    )
    rows = db.exec(stmt).all()
    if not rows:
        raise HTTPException(status_code=404, detail="No students found")
    return rows
