from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..deps import get_db, get_current_role
from app.db.models import Student, College, CollegeApplication, Ping, Transcript

router = APIRouter(tags=["profile"])

# ───────── College profile view for a student ─────────
@router.get("/college/{college_id}")
def college_profile(college_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_role)):
    # college_id here is actually the application_id
    app = db.exec(select(CollegeApplication).where(CollegeApplication.id == college_id)).first()
    if not app:
        raise HTTPException(404, "Application not found")

    pings = db.exec(select(Ping).where(Ping.application_id == app.id)).all()

    return {
        "college": {
            "name": app.college_name,
            "id": app.id
        },
        "application": app,
        "pings": pings
    }

# ───────── Student profile view for consultant ─────────
@router.get("/student/{student_id}")
def student_profile(student_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_role)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    transcripts = db.exec(select(Transcript).where(Transcript.student_id == student_id)).all()
    apps = db.exec(select(CollegeApplication).where(CollegeApplication.student_id == student_id)).all()

    return {
        "student": student,
        "transcripts": transcripts,
        "applications": apps
    }
