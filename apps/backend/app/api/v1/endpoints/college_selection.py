from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, Session
from typing import List
from pydantic import BaseModel
from ..deps import get_db, get_current_user
from app.db.models import Student, CollegeApplication, MajorCategory, CollegeApplicationStatus, EssayResponse
from app.api.v1.endpoints.college_essay_prompt_map import COLLEGE_ESSAY_MAP

router = APIRouter(prefix="/college-selection", tags=["college-selection"])

class CollegeApplicationRequest(BaseModel):
    college_name: str
    major: str
    major_category: MajorCategory

class CollegeSelectionResponse(BaseModel):
    message: str
    applications_created: int

def create_default_essays(application_id: int, college_name: str, db: Session):
    """Create default essay prompts for a new college application"""
    prompts = COLLEGE_ESSAY_MAP.get(college_name)
    if not prompts:
        prompts = [
            {"prompt": "Tell us about something that is meaningful to you and why. (250-350 words)", "response": ""},
            {"prompt": "Describe a challenge you faced and how you overcame it. What did you learn from this experience? (250-350 words)", "response": ""},
            {"prompt": "What motivates you to pursue your chosen major? How do you plan to use your education to make a difference? (250-350 words)", "response": ""},
            {"prompt": "Describe a project or activity that demonstrates your leadership skills and teamwork abilities. (250-350 words)", "response": ""},
            {"prompt": "What are your career goals and how will attending this college help you achieve them? (250-350 words)", "response": ""}
        ]
    for prompt_data in prompts:
        essay = EssayResponse(
            application_id=application_id,
            prompt=prompt_data["prompt"],
            response=prompt_data.get("response", "")
        )
        db.add(essay)
    db.commit()

@router.post("/")
def create_college_application(
    application: CollegeApplicationRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Create a single college application and automatically match with a consultant"""
    if not current_user.quiz_completed:
        raise HTTPException(status_code=400, detail="Student must complete the quiz first")
    college_app = CollegeApplication(
        student_id=current_user.id,
        college_name=application.college_name,
        major=application.major,
        major_category=application.major_category,
        status=CollegeApplicationStatus.DRAFT
    )
    db.add(college_app)
    db.commit()
    db.refresh(college_app)
    create_default_essays(college_app.id, college_app.college_name, db)
    try:
        from app.api.v1.endpoints.matching import match_single_application
        consultant = match_single_application(college_app.id, db)
        db.refresh(college_app)
        return {
            "college_id": college_app.id,
            "college": college_app.college_name,
            "major": college_app.major,
            "status": college_app.status.value,
            "consultant_id": college_app.consultant_id,
            "consultant_name": consultant.name if consultant else None,
            "match_score": college_app.match_score
        }
    except Exception as e:
        print(f"Matching failed for application {college_app.id}: {e}")
        return {
            "college_id": college_app.id,
            "college": college_app.college_name,
            "major": college_app.major,
            "status": college_app.status.value,
            "consultant_id": None,
            "consultant_name": None,
            "match_score": None
        }

@router.delete("/{application_id}")
def delete_college_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Delete a college application and all associated data"""
    
    # Get the application
    application = db.get(CollegeApplication, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="College application not found")
    
    # Check if the application belongs to the current user
    if application.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this application")
    
    # First, delete all related records manually to avoid foreign key issues
    from app.db.models import Ping, EssayResponse, Task, Comment
    
    # Delete comments related to pings for this application
    comments = db.exec(
        select(Comment)
        .join(Ping)
        .where(Ping.application_id == application_id)
    ).all()
    for comment in comments:
        db.delete(comment)
    
    # Delete pings for this application
    pings = db.exec(
        select(Ping).where(Ping.application_id == application_id)
    ).all()
    for ping in pings:
        db.delete(ping)
    
    # Delete tasks related to this application
    tasks = db.exec(
        select(Task).where(Task.related_application_id == application_id)
    ).all()
    for task in tasks:
        db.delete(task)
    
    # Delete essays for this application
    essays = db.exec(
        select(EssayResponse).where(EssayResponse.application_id == application_id)
    ).all()
    for essay in essays:
        db.delete(essay)
    
    # Finally delete the college application
    db.delete(application)
    db.commit()
    
    return {"message": "College application deleted successfully"}

@router.post("/submit-applications")
def submit_college_applications(
    applications: List[CollegeApplicationRequest],
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Submit college applications for a student"""
    if not current_user.quiz_completed:
        raise HTTPException(status_code=400, detail="Student must complete the quiz first")
    created_applications = []
    for app in applications:
        college_app = CollegeApplication(
            student_id=current_user.id,
            college_name=app.college_name,
            major=app.major,
            major_category=app.major_category,
            status=CollegeApplicationStatus.DRAFT
        )
        db.add(college_app)
        created_applications.append(college_app)
    db.commit()
    for college_app in created_applications:
        create_default_essays(college_app.id, college_app.college_name, db)
    current_user.college_selection_completed = True
    db.add(current_user)
    db.commit()
    return CollegeSelectionResponse(
        message="College applications submitted successfully",
        applications_created=len(created_applications)
    )

@router.get("/popular-colleges")
def get_popular_colleges():
    """Get list of popular colleges for selection"""
    from app.db.models import POPULAR_COLLEGES
    
    return {
        "colleges": POPULAR_COLLEGES
    }

@router.post("/cleanup-orphaned-pings")
def cleanup_orphaned_pings(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Clean up orphaned pings that have null application_id"""
    from app.db.models import Ping, Comment
    
    # Find pings with null application_id
    orphaned_pings = db.exec(
        select(Ping).where(
            Ping.student_id == current_user.id,
            Ping.application_id.is_(None)
        )
    ).all()
    
    cleaned_count = 0
    for ping in orphaned_pings:
        # Delete comments for this ping
        comments = db.exec(
            select(Comment).where(Comment.ping_id == ping.id)
        ).all()
        for comment in comments:
            db.delete(comment)
        
        # Delete the orphaned ping
        db.delete(ping)
        cleaned_count += 1
    
    db.commit()
    
    return {
        "message": f"Cleaned up {cleaned_count} orphaned pings",
        "cleaned_count": cleaned_count
    }

@router.get("/popular-majors")
def get_popular_majors():
    """Get list of popular majors for selection"""
    from app.db.models import POPULAR_MAJORS
    
    return {
        "majors": POPULAR_MAJORS
    } 