from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime

from ..deps import get_db, get_current_consultant, get_current_role
from app.db.models import Consultant, ConsultantMatchingQuizResponse, Subject, AcademicCompetition, ExtracurricularActivity, IncomeBracket, CitizenshipStatus, UnderrepresentedGroup

router = APIRouter(prefix="/consultant-matching-quiz", tags=["consultant-matching-quiz"])

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

def convert_subjects_to_enums(subject_strings: List[str]) -> List[Subject]:
    """Convert frontend subject strings to enum values"""
    subject_mapping = {
        "Mathematics": Subject.MATHEMATICS,
        "Computer Science": Subject.COMPUTER_SCIENCE,
        "Biology": Subject.BIOLOGY,
        "Chemistry": Subject.CHEMISTRY,
        "Physics": Subject.PHYSICS,
        "Environmental Science": Subject.ENVIRONMENTAL_SCIENCE,
        "Engineering": Subject.ENGINEERING,
        "Economics": Subject.ECONOMICS,
        "Political Science": Subject.POLITICAL_SCIENCE,
        "History": Subject.HISTORY,
        "Literature / English": Subject.LITERATURE_ENGLISH,
        "Philosophy": Subject.PHILOSOPHY,
        "Psychology": Subject.PSYCHOLOGY,
        "Sociology": Subject.SOCIOLOGY,
        "Art / Art History": Subject.ART_HISTORY,
        "Music Theory / Performance": Subject.MUSIC_THEORY,
        "Foreign Languages (e.g., Spanish, French, Chinese)": Subject.FOREIGN_LANGUAGES,
        "Business / Entrepreneurship": Subject.BUSINESS_ENTREPRENEURSHIP,
        "Law / Pre-Law": Subject.LAW_PRE_LAW,
        "Education / Teaching": Subject.EDUCATION_TEACHING
    }
    return [subject_mapping.get(s, Subject.MATHEMATICS) for s in subject_strings if s in subject_mapping]

def convert_competitions_to_enums(competition_strings: List[str]) -> List[AcademicCompetition]:
    """Convert frontend competition strings to enum values"""
    competition_mapping = {
        "USACO (Informatics Olympiad)": AcademicCompetition.USACO,
        "ISEF (Science & Engineering Fair)": AcademicCompetition.ISEF,
        "AMC / AIME (Math Olympiad)": AcademicCompetition.AMC_AIME,
        "Science Olympiad": AcademicCompetition.SCIENCE_OLYMPIAD,
        "DECA": AcademicCompetition.DECA,
        "Model UN": AcademicCompetition.MODEL_UN,
        "FIRST Robotics": AcademicCompetition.FIRST_ROBOTICS,
        "Intel STS / Regeneron": AcademicCompetition.INTEL_STS
    }
    return [competition_mapping.get(c, AcademicCompetition.USACO) for c in competition_strings if c in competition_mapping]

def convert_activities_to_enums(activity_strings: List[str]) -> List[ExtracurricularActivity]:
    """Convert frontend activity strings to enum values"""
    activity_mapping = {
        "Varsity Athletics": ExtracurricularActivity.VARSITY_ATHLETICS,
        "Debate or Speech": ExtracurricularActivity.DEBATE_SPEECH,
        "Performing Arts (e.g., Band, Theater)": ExtracurricularActivity.PERFORMING_ARTS,
        "Volunteering / Community Service": ExtracurricularActivity.VOLUNTEERING,
        "Entrepreneurship / Startup Projects": ExtracurricularActivity.ENTREPRENEURSHIP,
        "Student Government": ExtracurricularActivity.STUDENT_GOVERNMENT
    }
    return [activity_mapping.get(a, ExtracurricularActivity.VARSITY_ATHLETICS) for a in activity_strings if a in activity_mapping]

@router.get("/check-completion")
def check_quiz_completion(
    db: Session = Depends(get_db),
    current_user: Consultant = Depends(get_current_consultant),
    role: str = Depends(get_current_role)
):
    response = db.exec(
        select(ConsultantMatchingQuizResponse).where(
            ConsultantMatchingQuizResponse.consultant_id == current_user.id
        )
    ).first()
    return {"quiz_completed": bool(response), "role": role}

@router.post("/submit", response_model=ConsultantMatchingQuizResponse)
def submit_matching_quiz(
    quiz_data: dict,
    db: Session = Depends(get_db),
    current_user: Consultant = Depends(get_current_consultant)
):
    # Convert display values to enum values
    family_income_bracket = None
    if quiz_data.get("family_income_bracket"):
        family_income_bracket = convert_income_bracket(quiz_data.get("family_income_bracket"))
    
    citizenship_status = None
    if quiz_data.get("citizenship_status"):
        citizenship_status = convert_citizenship_status(quiz_data.get("citizenship_status"))
    
    is_underrepresented_group = None
    if quiz_data.get("is_underrepresented_group"):
        is_underrepresented_group = convert_underrepresented_group(quiz_data.get("is_underrepresented_group"))
    
    # Convert frontend strings to enums
    passionate_subjects = convert_subjects_to_enums(quiz_data.get("passionate_subjects", []))
    academic_competitions = convert_competitions_to_enums(quiz_data.get("academic_competitions", []))
    extracurricular_activities = convert_activities_to_enums(quiz_data.get("extracurricular_activities", []))
    
    existing_response = db.exec(
        select(ConsultantMatchingQuizResponse).where(
            ConsultantMatchingQuizResponse.consultant_id == current_user.id
        )
    ).first()
    
    if existing_response:
        # Update existing response
        existing_response.passionate_subjects = passionate_subjects
        existing_response.academic_competitions = academic_competitions
        existing_response.has_published_research = quiz_data.get("has_published_research")
        existing_response.extracurricular_activities = extracurricular_activities
        existing_response.other_subjects = quiz_data.get("other_subjects")
        existing_response.other_activities = quiz_data.get("other_activities")
        existing_response.gender = quiz_data.get("gender")
        existing_response.family_income_bracket = family_income_bracket
        existing_response.is_first_generation = quiz_data.get("is_first_generation")
        existing_response.citizenship_status = citizenship_status
        existing_response.is_underrepresented_group = is_underrepresented_group
        existing_response.updated_at = datetime.utcnow()
        response = existing_response
    else:
        new_response = ConsultantMatchingQuizResponse(
            consultant_id=current_user.id,
            passionate_subjects=passionate_subjects,
            academic_competitions=academic_competitions,
            has_published_research=quiz_data.get("has_published_research"),
            extracurricular_activities=extracurricular_activities,
            other_subjects=quiz_data.get("other_subjects"),
            other_activities=quiz_data.get("other_activities"),
            gender=quiz_data.get("gender"),
            family_income_bracket=family_income_bracket,
            is_first_generation=quiz_data.get("is_first_generation"),
            citizenship_status=citizenship_status,
            is_underrepresented_group=is_underrepresented_group
        )
        db.add(new_response)
        response = new_response
    db.commit()
    db.refresh(response)
    return response

@router.get("/responses", response_model=ConsultantMatchingQuizResponse)
def get_quiz_responses(
    db: Session = Depends(get_db),
    current_user: Consultant = Depends(get_current_consultant)
):
    response = db.exec(
        select(ConsultantMatchingQuizResponse).where(
            ConsultantMatchingQuizResponse.consultant_id == current_user.id
        )
    ).first()
    if not response:
        raise HTTPException(404, "No quiz responses found")
    return response 