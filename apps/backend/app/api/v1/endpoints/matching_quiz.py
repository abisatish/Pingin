from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime

from ..deps import get_db, get_current_user, get_current_role
from app.db.models import Student, StudentMatchingQuizResponse, IncomeBracket, CitizenshipStatus, UnderrepresentedGroup
from app.schemas.student import MatchingQuizRequest, MatchingQuizResponse

router = APIRouter(prefix="/matching-quiz", tags=["matching-quiz"])

def convert_income_bracket(display_value: str) -> IncomeBracket:
    """Convert frontend display value to enum value"""
    mapping = {
        "<$50,000": IncomeBracket.UNDER_50K,
        "$50,000–$100,000": IncomeBracket.FIFTY_TO_100K,
        "$100,000–$200,000": IncomeBracket.HUNDRED_TO_200K,
        "$200,000+": IncomeBracket.OVER_200K,
        "Prefer not to say": IncomeBracket.PREFER_NOT_TO_SAY
    }
    return mapping.get(display_value, IncomeBracket.PREFER_NOT_TO_SAY)

def convert_citizenship_status(display_value: str) -> CitizenshipStatus:
    """Convert frontend display value to enum value"""
    mapping = {
        "U.S. Citizen": CitizenshipStatus.US_CITIZEN,
        "U.S. Permanent Resident": CitizenshipStatus.US_PERMANENT_RESIDENT,
        "International Student": CitizenshipStatus.INTERNATIONAL
    }
    return mapping.get(display_value, CitizenshipStatus.US_CITIZEN)

def convert_underrepresented_group(display_value: str) -> UnderrepresentedGroup:
    """Convert frontend display value to enum value"""
    mapping = {
        "Yes": UnderrepresentedGroup.YES,
        "No": UnderrepresentedGroup.NO,
        "Prefer not to say": UnderrepresentedGroup.PREFER_NOT_TO_SAY
    }
    return mapping.get(display_value, UnderrepresentedGroup.PREFER_NOT_TO_SAY)

@router.get("/check-completion")
def check_quiz_completion(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user),
    role: str = Depends(get_current_role)
):
    """Check if the current user has completed the matching quiz"""
    return {"quiz_completed": current_user.quiz_completed, "role": role}

@router.post("/submit", response_model=MatchingQuizResponse)
def submit_matching_quiz(
    quiz_data: MatchingQuizRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Submit the matching quiz responses"""
    
    # Convert display values to enum values
    family_income_bracket = None
    if quiz_data.family_income_bracket:
        family_income_bracket = convert_income_bracket(quiz_data.family_income_bracket)
    
    citizenship_status = None
    if quiz_data.citizenship_status:
        citizenship_status = convert_citizenship_status(quiz_data.citizenship_status)
    
    is_underrepresented_group = None
    if quiz_data.is_underrepresented_group:
        is_underrepresented_group = convert_underrepresented_group(quiz_data.is_underrepresented_group)
    
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
        existing_response.family_income_bracket = family_income_bracket
        existing_response.is_first_generation = quiz_data.is_first_generation
        existing_response.citizenship_status = citizenship_status
        existing_response.is_underrepresented_group = is_underrepresented_group
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
            family_income_bracket=family_income_bracket,
            is_first_generation=quiz_data.is_first_generation,
            citizenship_status=citizenship_status,
            is_underrepresented_group=is_underrepresented_group,
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