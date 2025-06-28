from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime

from ..deps import get_db, get_current_user
from app.db.models import Student, StudentMatchingQuizResponse
from app.schemas.student import MatchingQuizRequest, MatchingQuizResponse

router = APIRouter(prefix="/matching-quiz", tags=["matching-quiz"])

@router.get("/check-completion")
def check_quiz_completion(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Check if the current user has completed the matching quiz"""
    return {"quiz_completed": current_user.quiz_completed}

@router.post("/submit", response_model=MatchingQuizResponse)
def submit_matching_quiz(
    quiz_data: MatchingQuizRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Submit the matching quiz responses"""
    
    # Check if user already has quiz responses
    existing_response = db.exec(
        select(StudentMatchingQuizResponse).where(
            StudentMatchingQuizResponse.student_id == current_user.id
        )
    ).first()
    
    if existing_response:
        # Update existing response
        existing_response.passionate_subjects = quiz_data.passionate_subjects
        existing_response.academic_competitions = quiz_data.academic_competitions
        existing_response.has_published_research = quiz_data.has_published_research
        existing_response.extracurricular_activities = quiz_data.extracurricular_activities
        existing_response.gender = quiz_data.gender
        existing_response.family_income_bracket = quiz_data.family_income_bracket
        existing_response.is_first_generation = quiz_data.is_first_generation
        existing_response.citizenship_status = quiz_data.citizenship_status
        existing_response.is_underrepresented_group = quiz_data.is_underrepresented_group
        existing_response.other_subjects = quiz_data.other_subjects
        existing_response.other_activities = quiz_data.other_activities
        existing_response.updated_at = datetime.utcnow()
        
        response = existing_response
    else:
        # Create new response
        new_response = StudentMatchingQuizResponse(
            student_id=current_user.id,
            passionate_subjects=quiz_data.passionate_subjects,
            academic_competitions=quiz_data.academic_competitions,
            has_published_research=quiz_data.has_published_research,
            extracurricular_activities=quiz_data.extracurricular_activities,
            gender=quiz_data.gender,
            family_income_bracket=quiz_data.family_income_bracket,
            is_first_generation=quiz_data.is_first_generation,
            citizenship_status=quiz_data.citizenship_status,
            is_underrepresented_group=quiz_data.is_underrepresented_group,
            other_subjects=quiz_data.other_subjects,
            other_activities=quiz_data.other_activities
        )
        db.add(new_response)
        response = new_response
    
    # Update student's quiz_completed status
    current_user.quiz_completed = True
    
    db.commit()
    db.refresh(response)
    
    return response

@router.get("/responses", response_model=MatchingQuizResponse)
def get_quiz_responses(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Get the current user's quiz responses"""
    response = db.exec(
        select(StudentMatchingQuizResponse).where(
            StudentMatchingQuizResponse.student_id == current_user.id
        )
    ).first()
    
    if not response:
        raise HTTPException(404, "No quiz responses found")
    
    return response 