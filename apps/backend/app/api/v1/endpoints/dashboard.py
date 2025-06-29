from fastapi import APIRouter, Depends, Header
from sqlmodel import select, Session
from ..deps import get_db, get_current_role, get_current_user, get_current_consultant
from app.db.models import Ping, CollegeApplication, Student, Consultant, Transcript, EssayResponse, Comment

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard")
def get_dashboard(
    role: str = Depends(get_current_role),
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    if role == "student":
        current_user = get_current_user(authorization, db)
        student_id = current_user.id
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
                    "college_id": app.id,
                    "college": app.college_name,
                    "major": app.major,
                    "status": app.status.value if app.status else None
                } for app in apps
            ]
        }

    elif role == "consultant":
        current_consultant = get_current_consultant(authorization, db)
        consultant_id = current_consultant.id
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

@router.get("/college/{college_id}/dashboard")
def get_college_dashboard(
    college_id: int,
    role: str = Depends(get_current_role),
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    if role != "student":
        return {"error": "Only students can access college dashboards"}
    
    current_user = get_current_user(authorization, db)
    student_id = current_user.id
    
    # Get the college application
    application = db.exec(
        select(CollegeApplication).where(
            CollegeApplication.id == college_id,
            CollegeApplication.student_id == student_id
        )
    ).first()
    
    if not application:
        return {"error": "College application not found"}
    
    # Get essays for this application
    essays = db.exec(
        select(EssayResponse).where(EssayResponse.application_id == college_id)
    ).all()
    
    # Get recent feedback/comments
    recent_comments = db.exec(
        select(Comment)
        .join(Ping)
        .where(Ping.application_id == college_id)
        .order_by(Comment.created_at.desc())
        .limit(3)
    ).all()
    
    # Calculate progress metrics
    total_essays = len(essays)
    completed_essays = len([e for e in essays if e.response and len(e.response.strip()) > 0])
    
    # Mock data for documents and recommendations (these would need separate tables)
    total_documents = 12
    submitted_documents = 8
    total_recommendations = 3
    received_recommendations = 1
    
    return {
        "college": {
            "id": application.id,
            "name": application.college_name,
            "major": application.major,
            "status": application.status.value if application.status else "draft",
            "deadline": "Jan 5, 2026",  # This would come from a separate table
            "acceptance_rate": "3.9%",  # This would come from a separate table
            "category": "REACH"  # This would be calculated based on student stats
        },
        "progress": {
            "essays": {
                "completed": completed_essays,
                "total": total_essays,
                "percentage": (completed_essays / max(total_essays, 1)) * 100
            },
            "documents": {
                "submitted": submitted_documents,
                "total": total_documents,
                "percentage": (submitted_documents / total_documents) * 100
            },
            "recommendations": {
                "received": received_recommendations,
                "total": total_recommendations,
                "percentage": (received_recommendations / total_recommendations) * 100
            },
            "application_status": "In Progress"
        },
        "current_essay": {
            "title": "Personal Statement",
            "prompt": "Tell us about something that is meaningful to you and why. (250-350 words)",
            "response": essays[0].response if essays else "",
            "word_count": len(essays[0].response.split()) if essays and essays[0].response else 0,
            "max_words": 350,
            "last_updated": essays[0].last_edited.isoformat() if essays else None
        },
        "recent_feedback": [
            {
                "id": comment.id,
                "author": "Viraj Nain",
                "author_role": "UChicago Mentor",
                "avatar": "/images/1699281015444-removebg-preview.png",
                "content": comment.body,
                "timestamp": comment.created_at.isoformat(),
                "resolved": comment.resolved
            } for comment in recent_comments
        ],
        "documents": [
            {
                "id": i,
                "name": f"Personal Statement v{i}.docx",
                "type": "essay",
                "updated_at": "2 hours ago",
                "url": "#"
            } for i in range(1, 5)
        ]
    }
