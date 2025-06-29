from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import select, Session
from typing import List, Dict
from pydantic import BaseModel
from ..deps import get_db, get_current_user
from app.db.models import (
    Student, CollegeApplication, Consultant, StudentMatchingQuizResponse,
    MajorCategory, CollegeApplicationStatus, ConsultantMatchingQuizResponse
)
import json

router = APIRouter(prefix="/matching", tags=["matching"])

class MatchingResponse(BaseModel):
    message: str
    applications_matched: int
    total_applications: int

def calculate_match_score(student_quiz: StudentMatchingQuizResponse, consultant_quiz: ConsultantMatchingQuizResponse, major_category: MajorCategory) -> float:
    """Calculate match score between student and consultant using quiz answers"""
    if not consultant_quiz:
        return 0.0
    score = 0.0
    # Parse consultant quiz fields
    try:
        consultant_subjects = json.loads(consultant_quiz.passionate_subjects) if consultant_quiz.passionate_subjects else []
    except:
        consultant_subjects = []
    try:
        consultant_competitions = json.loads(consultant_quiz.academic_competitions) if consultant_quiz.academic_competitions else []
    except:
        consultant_competitions = []
    try:
        consultant_activities = json.loads(consultant_quiz.extracurricular_activities) if consultant_quiz.extracurricular_activities else []
    except:
        consultant_activities = []
    # Parse student quiz fields
    try:
        student_subjects = json.loads(student_quiz.passionate_subjects) if isinstance(student_quiz.passionate_subjects, str) else student_quiz.passionate_subjects or []
    except:
        student_subjects = []
    try:
        student_competitions = json.loads(student_quiz.academic_competitions) if isinstance(student_quiz.academic_competitions, str) else student_quiz.academic_competitions or []
    except:
        student_competitions = []
    try:
        student_activities = json.loads(student_quiz.extracurricular_activities) if isinstance(student_quiz.extracurricular_activities, str) else student_quiz.extracurricular_activities or []
    except:
        student_activities = []
    # Major category matching (highest weight)
    if major_category.value in consultant_subjects:
        score += 40.0
    # Subject matching
    for subject in student_subjects:
        if subject in consultant_subjects:
            score += 15.0
    # Competition matching
    for competition in student_competitions:
        if competition in consultant_competitions:
            score += 10.0
    # Activity matching
    for activity in student_activities:
        if activity in consultant_activities:
            score += 5.0
    # Research experience bonus
    if student_quiz.has_published_research and consultant_quiz.has_published_research:
        score += 10.0
    # First-generation student bonus for certain consultants
    if student_quiz.is_first_generation and consultant_quiz.first_generation:
        score += 5.0
    # Cap score at 100
    return min(score, 100.0)

def match_student_applications(student_id: int, db: Session):
    """Match a student's applications with consultants using quiz answers"""
    student = db.exec(select(Student).where(Student.id == student_id)).first()
    if not student:
        return
    quiz_response = db.exec(
        select(StudentMatchingQuizResponse).where(StudentMatchingQuizResponse.student_id == student_id)
    ).first()
    if not quiz_response:
        return
    consultants = db.exec(select(Consultant)).all()
    applications = db.exec(
        select(CollegeApplication).where(
            CollegeApplication.student_id == student_id,
            CollegeApplication.consultant_id.is_(None)
        )
    ).all()
    matched_count = 0
    for application in applications:
        best_consultant = None
        best_score = -1.0
        for consultant in consultants:
            consultant_quiz = db.exec(
                select(ConsultantMatchingQuizResponse).where(
                    ConsultantMatchingQuizResponse.consultant_id == consultant.id
                )
            ).first()
            score = calculate_match_score(quiz_response, consultant_quiz, application.major_category)
            if score > best_score:
                best_score = score
                best_consultant = consultant
        if best_consultant is not None:
            application.consultant_id = best_consultant.id
            application.match_score = best_score
            db.add(application)
            matched_count += 1
    student.matching_completed = True
    db.add(student)
    db.commit()
    return matched_count

@router.post("/start-matching")
def start_matching(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Start the matching process for a student"""
    
    # Check if student has completed quiz and college selection
    if not current_user.quiz_completed:
        raise HTTPException(status_code=400, detail="Student must complete the quiz first")
    
    if not current_user.college_selection_completed:
        raise HTTPException(status_code=400, detail="Student must complete college selection first")
    
    if current_user.matching_completed:
        raise HTTPException(status_code=400, detail="Matching already completed")
    
    # Get total applications to match
    total_applications = len(db.exec(
        select(CollegeApplication).where(
            CollegeApplication.student_id == current_user.id,
            CollegeApplication.consultant_id.is_(None)
        )
    ).all())
    
    if total_applications == 0:
        raise HTTPException(status_code=400, detail="No applications to match")
    
    # Start matching in background
    background_tasks.add_task(match_student_applications, current_user.id, db)
    
    return {
        "message": "Matching process started",
        "total_applications": total_applications
    }

@router.get("/matching-status")
def get_matching_status(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Get the current matching status for a student"""
    
    # Get applications with consultants assigned
    matched_applications = db.exec(
        select(CollegeApplication).where(
            CollegeApplication.student_id == current_user.id,
            CollegeApplication.consultant_id.is_not(None)
        )
    ).all()
    
    # Get total applications
    total_applications = len(db.exec(
        select(CollegeApplication).where(CollegeApplication.student_id == current_user.id)
    ).all())
    
    return {
        "matching_completed": current_user.matching_completed,
        "matched_applications": len(matched_applications),
        "total_applications": total_applications,
        "applications": [
            {
                "id": app.id,
                "college_name": app.college_name,
                "major": app.major,
                "consultant_id": app.consultant_id,
                "match_score": app.match_score
            } for app in matched_applications
        ]
    } 