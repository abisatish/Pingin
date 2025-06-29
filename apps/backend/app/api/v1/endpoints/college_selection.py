from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, Session
from typing import List
from pydantic import BaseModel
from ..deps import get_db, get_current_user
from app.db.models import Student, CollegeApplication, MajorCategory, CollegeApplicationStatus

router = APIRouter(prefix="/college-selection", tags=["college-selection"])

class CollegeApplicationRequest(BaseModel):
    college_name: str
    major: str
    major_category: MajorCategory

class CollegeSelectionResponse(BaseModel):
    message: str
    applications_created: int

@router.post("/submit-applications")
def submit_college_applications(
    applications: List[CollegeApplicationRequest],
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Submit college applications for a student"""
    
    # Check if student has completed the quiz
    if not current_user.quiz_completed:
        raise HTTPException(status_code=400, detail="Student must complete the quiz first")
    
    # Create college applications
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
    
    # Update student's college selection status
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

@router.get("/popular-majors")
def get_popular_majors():
    """Get list of popular majors for selection"""
    from app.db.models import POPULAR_MAJORS
    
    return {
        "majors": POPULAR_MAJORS
    } 