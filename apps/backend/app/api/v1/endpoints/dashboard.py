from fastapi import APIRouter, Depends
from sqlmodel import select, Session
from ..deps import get_db, get_current_role
from app.db.models import Ping, CollegeApplication, Student, Consultant, Transcript

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard")
def get_dashboard(role: str = Depends(get_current_role), db: Session = Depends(get_db)):
    if role == "student":
        # Fake for now, real user id would come from token
        student_id = 1  
        pings = db.exec(
            select(Ping).where(Ping.student_id == student_id).order_by(Ping.created_at.desc()).limit(5)
        ).all()

        apps = db.exec(
            select(CollegeApplication).where(CollegeApplication.student_id == student_id)
        ).all()

        return {
            "role": role,
            "pings": [ 
                {
                    "id": p.id,
                    "question": p.question,
                    "status": p.status
                } for p in pings
            ],
            "applications": [
                {
                    "college": app.college.name,
                    "college_id": app.college_id
                } for app in apps
            ]
        }

    elif role == "consultant":
        consultant_id = 1
        pings = db.exec(
            select(Ping).where(Ping.consultant_id == consultant_id).order_by(Ping.created_at.desc()).limit(5)
        ).all()

        students = db.exec(
            select(Student).join(CollegeApplication).where(CollegeApplication.consultant_id == consultant_id)
        ).all()

        return {
            "role": role,
            "pings": [ 
                {
                    "id": p.id,
                    "question": p.question,
                    "status": p.status
                } for p in pings
            ],
            "students": [
                {
                    "id": s.id,
                    "registration_id": s.registration_id,
                    "gpa": db.exec(select(Transcript.gpa).where(Transcript.student_id == s.id)).first(),
                    "photo_url": s.photo_url
                } for s in students
            ]
        }

    return {"role": role}
