from fastapi import APIRouter, Depends, Header
from sqlmodel import select, Session
from ..deps import get_db, get_current_role, get_current_user, get_current_consultant
from app.db.models import Ping, CollegeApplication, Student, Consultant, Transcript, EssayResponse, Comment, Task, TaskStatus
from datetime import datetime, timedelta

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

        # Get upcoming tasks (pending and in progress, ordered by due date)
        tasks = db.exec(
            select(Task)
            .where(
                Task.student_id == student_id,
                Task.status.in_([TaskStatus.PENDING, TaskStatus.IN_PROGRESS])
            )
            .order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
            .limit(10)
        ).all()

        # Calculate some basic stats
        total_applications = len(apps)
        essays_complete = "0/0"  # This would need to be calculated from essays
        pings_remaining = 10  # This would need to be calculated from available pings

        return {
            "role": role,
            "id": student_id,
            "name": current_user.name,
            "token": authorization,
            "student_id": student_id,
            "pings": [ 
                {
                    "id": p.id,
                    "question": p.question,
                    "status": p.status,
                    "answer": p.answer,
                    "created_at": p.created_at.isoformat(),
                    "application_id": p.application_id,
                    "application": {
                        "college_name": next((app.college_name for app in apps if app.id == p.application_id), "Unknown College"),
                        "major": next((app.major for app in apps if app.id == p.application_id), "Unknown Major")
                    }
                } for p in pings
            ],
            "applications": [
                {
                    "college_id": app.id,
                    "college": app.college_name,
                    "major": app.major,
                    "status": app.status.value if app.status else None
                } for app in apps
            ],
            "tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "due": task.due_date.strftime("%b %d") if task.due_date else "No due date",
                    "status": task.status.value,
                    "priority": task.priority.value,
                    "category": task.category,
                    "icon": "/images/circle-alert.png" if task.priority.value in ["high", "urgent"] else "/images/check.png"
                } for task in tasks
            ],
            "applicationsCount": total_applications,
            "essays_complete": essays_complete,
            "pings_remaining": pings_remaining,
            # Mock data for other dashboard sections
            "colleges": [
                { "name": "Stanford University", "acceptance": "15%", "deadline": "Jan 5", "type": "REACH" },
                { "name": "UC Berkeley", "acceptance": "65%", "deadline": "Nov 30", "type": "TARGET" },
                { "name": "UCLA", "acceptance": "70%", "deadline": "Nov 30", "type": "TARGET" },
                { "name": "University of Washington", "acceptance": "90%", "deadline": "Dec 15", "type": "SAFETY" },
            ],
            "subjects": ["Mathematics", "Biology", "Anthropology", "Computer Science", "Physics", "Environmental Science"],
            "activity": [
                { "title": "Essay feedback received", "by": "Dr. Sarah Chen", "time": "2 hours ago" },
                { "title": "College list updated", "by": "You", "time": "1 day ago" },
                { "title": "Interview prep session scheduled", "by": "Prof. Michael Rodriguez", "time": "2 days ago" },
            ],
            "nextSession": { "title": "Essay Review with Dr. Sarah Chen", "time": "Tomorrow at 3:00 PM" }
        }

    elif role == "consultant":
        current_consultant = get_current_consultant(authorization, db)
        consultant_id = current_consultant.id
        
        # Get recent pings for this consultant
        pings = db.exec(
            select(Ping).where(Ping.consultant_id == consultant_id).order_by(Ping.created_at.desc()).limit(10)
        ).all()

        # Get students assigned to this consultant (deduplicated)
        students = db.exec(
            select(Student)
            .join(CollegeApplication)
            .where(CollegeApplication.consultant_id == consultant_id)
            .distinct()
        ).all()

        # Calculate last active time for each student based on their most recent ping
        student_last_active = {}
        for student in students:
            # Get the most recent ping for this student
            latest_ping = db.exec(
                select(Ping)
                .where(Ping.student_id == student.id)
                .order_by(Ping.created_at.desc())
                .limit(1)
            ).first()
            
            if latest_ping:
                student_last_active[student.id] = latest_ping.created_at.isoformat()
            else:
                student_last_active[student.id] = None

        # Calculate statistics
        active_students_count = len(students)
        pending_reviews_count = len([p for p in pings if p.status == "open"])

        return {
            "role": role,
            "consultant_id": consultant_id,
            "consultant_name": current_consultant.name,
            "stats": {
                "active_students": active_students_count,
                "pending_reviews": pending_reviews_count,
                "sessions_this_month": 18,  # Mock data for now
                "hours_this_week": 12  # Mock data for now
            },
            "pings": [ 
                {
                    "id": p.id,
                    "question": p.question,
                    "status": p.status,
                    "created_at": p.created_at.isoformat(),
                    "student_id": p.student_id,
                    "application_id": p.application_id
                } for p in pings
            ],
            "students": [
                {
                    "id": s.id,
                    "name": s.name,
                    "registration_id": s.registration_id,
                    "gpa": db.exec(select(Transcript.gpa).where(Transcript.student_id == s.id)).first(),
                    "photo_url": s.photo_url,
                    "last_active": student_last_active.get(s.id),
                    "status": "Active"  # This could be calculated based on recent activity
                } for s in students
            ],
            "recent_messages": [
                {
                    "id": p.id,
                    "sender": "Student",  # Pings are always from students
                    "student_name": db.get(Student, p.student_id).name if db.get(Student, p.student_id) else "Unknown Student",
                    "message": p.question[:100] + "..." if len(p.question) > 100 else p.question,
                    "time": p.created_at.isoformat(),
                    "unread": p.status == "open",  # Mark as unread if ping is still open
                    "ping_id": p.id,
                    "ping_status": p.status
                } for p in pings
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
            "category": "REACH",  # This would be calculated based on student stats
            "consultant_id": application.consultant_id  # Add consultant assignment
        },
        "essays": [
            {
                "id": essay.id,
                "prompt": essay.prompt,
                "response": essay.response,
                "last_edited": essay.last_edited.isoformat()
            } for essay in essays
        ],
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
