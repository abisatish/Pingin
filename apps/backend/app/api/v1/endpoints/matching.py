from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import select, Session
from typing import List, Dict
from pydantic import BaseModel
from ..deps import get_db, get_current_user
from app.db.models import (
    Student, CollegeApplication, Consultant, StudentMatchingQuizResponse,
    MajorCategory, CollegeApplicationStatus, ConsultantMatchingQuizResponse,
    Subject, AcademicCompetition, ExtracurricularActivity
)
import json

router = APIRouter(prefix="/matching", tags=["matching"])

class MatchingResponse(BaseModel):
    message: str
    applications_matched: int
    total_applications: int

def calculate_match_score(student_quiz: StudentMatchingQuizResponse, consultant_quiz: ConsultantMatchingQuizResponse, major_category: MajorCategory, major_name: str) -> float:
    """Calculate match score between student and consultant using quiz answers"""
    if not consultant_quiz:
        return 0.0
    
    # DEBUG: Print raw quiz responses
    print(f"\n=== QUIZ RESPONSES DEBUG ===")
    print(f"Major Category: {major_category.value}")
    print(f"Major Name: {major_name}")
    print(f"Student ID: {student_quiz.student_id}")
    print(f"Consultant ID: {consultant_quiz.consultant_id}")
    print(f"\nSTUDENT QUIZ RESPONSES:")
    print(f"  Passionate Subjects: {student_quiz.passionate_subjects}")
    print(f"  Academic Competitions: {student_quiz.academic_competitions}")
    print(f"  Extracurricular Activities: {student_quiz.extracurricular_activities}")
    print(f"  Has Published Research: {student_quiz.has_published_research}")
    print(f"  Is First Generation: {student_quiz.is_first_generation}")
    print(f"  Family Income Bracket: {student_quiz.family_income_bracket}")
    print(f"  Citizenship Status: {student_quiz.citizenship_status}")
    print(f"  Is Underrepresented Group: {student_quiz.is_underrepresented_group}")
    print(f"\nCONSULTANT QUIZ RESPONSES:")
    print(f"  Passionate Subjects: {consultant_quiz.passionate_subjects}")
    print(f"  Academic Competitions: {consultant_quiz.academic_competitions}")
    print(f"  Extracurricular Activities: {consultant_quiz.extracurricular_activities}")
    print(f"  Has Published Research: {consultant_quiz.has_published_research}")
    print(f"  Is First Generation: {consultant_quiz.is_first_generation}")
    print(f"  Family Income Bracket: {consultant_quiz.family_income_bracket}")
    print(f"  Citizenship Status: {consultant_quiz.citizenship_status}")
    print(f"  Is Underrepresented Group: {consultant_quiz.is_underrepresented_group}")
    print(f"=== END QUIZ RESPONSES ===\n")
    
    # Get consultant subjects, competitions, and activities (now using enums)
    consultant_subjects = consultant_quiz.passionate_subjects or []
    consultant_competitions = consultant_quiz.academic_competitions or []
    consultant_activities = consultant_quiz.extracurricular_activities or []
    
    # Get student subjects, competitions, and activities (now using enums)
    student_subjects = student_quiz.passionate_subjects or []
    student_competitions = student_quiz.academic_competitions or []
    student_activities = student_quiz.extracurricular_activities or []
    
    # Handle SQLAlchemy JSON serialization - convert strings back to enums if needed
    def convert_strings_to_enums(string_list, enum_class, mapping):
        """Convert string list to enum list, handling SQLAlchemy JSON serialization"""
        if not string_list:
            return []
        
        # If it's already a list of enums, return as is
        if string_list and hasattr(string_list[0], 'value'):
            return string_list
        
        # If it's a list of strings (from SQLAlchemy JSON serialization), convert to enums
        if isinstance(string_list[0], str):
            return [mapping.get(s) for s in string_list if s in mapping]
        
        return []
    
    # Subject mapping
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
    
    # Competition mapping
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
    
    # Activity mapping
    activity_mapping = {
        "Varsity Athletics": ExtracurricularActivity.VARSITY_ATHLETICS,
        "Debate or Speech": ExtracurricularActivity.DEBATE_SPEECH,
        "Performing Arts (e.g., Band, Theater)": ExtracurricularActivity.PERFORMING_ARTS,
        "Volunteering / Community Service": ExtracurricularActivity.VOLUNTEERING,
        "Entrepreneurship / Startup Projects": ExtracurricularActivity.ENTREPRENEURSHIP,
        "Student Government": ExtracurricularActivity.STUDENT_GOVERNMENT
    }
    
    # Convert to enums if needed (SQLAlchemy JSON columns serialize enums to strings)
    consultant_subjects = convert_strings_to_enums(consultant_subjects, Subject, subject_mapping)
    consultant_competitions = convert_strings_to_enums(consultant_competitions, AcademicCompetition, competition_mapping)
    consultant_activities = convert_strings_to_enums(consultant_activities, ExtracurricularActivity, activity_mapping)
    
    student_subjects = convert_strings_to_enums(student_subjects, Subject, subject_mapping)
    student_competitions = convert_strings_to_enums(student_competitions, AcademicCompetition, competition_mapping)
    student_activities = convert_strings_to_enums(student_activities, ExtracurricularActivity, activity_mapping)
    
    # DEBUG: Show enum data
    print(f"DEBUG ENUM DATA:")
    print(f"  Consultant subjects (enums): {[s.value for s in consultant_subjects]}")
    print(f"  Student subjects (enums): {[s.value for s in student_subjects]}")
    print(f"  Consultant competitions (enums): {[c.value for c in consultant_competitions]}")
    print(f"  Student competitions (enums): {[c.value for c in student_competitions]}")
    print(f"  Consultant activities (enums): {[a.value for a in consultant_activities]}")
    print(f"  Student activities (enums): {[a.value for a in student_activities]}")
    print(f"  Major name to match: '{major_name}'")
    
    score = 0.0
    
    # Major matching (highest weight) - check if major name matches any consultant subject
    consultant_subject_values = [s.value for s in consultant_subjects]
    if major_name in consultant_subject_values:
        score += 40.0
        print(f"DEBUG: Major '{major_name}' found in consultant subjects: +40 points")
    else:
        print(f"DEBUG: Major '{major_name}' NOT found in consultant subjects: {consultant_subject_values}")
    
    # Subject matching
    subject_matches = []
    for student_subject in student_subjects:
        if student_subject in consultant_subjects:
            score += 15.0
            subject_matches.append(student_subject.value)
    print(f"DEBUG: Subject matches: {subject_matches} = +{len(subject_matches) * 15} points")
    
    # Competition matching
    competition_matches = []
    for student_competition in student_competitions:
        if student_competition in consultant_competitions:
            score += 10.0
            competition_matches.append(student_competition.value)
    print(f"DEBUG: Competition matches: {competition_matches} = +{len(competition_matches) * 10} points")
    
    # Activity matching
    activity_matches = []
    for student_activity in student_activities:
        if student_activity in consultant_activities:
            score += 5.0
            activity_matches.append(student_activity.value)
    print(f"DEBUG: Activity matches: {activity_matches} = +{len(activity_matches) * 5} points")
    
    # Research experience bonus
    if student_quiz.has_published_research and consultant_quiz.has_published_research:
        score += 10.0
        print(f"DEBUG: Research bonus: +10 points")
    else:
        print(f"DEBUG: No research bonus (student: {student_quiz.has_published_research}, consultant: {consultant_quiz.has_published_research})")
    
    # First-generation student bonus for certain consultants
    if student_quiz.is_first_generation and consultant_quiz.is_first_generation:
        score += 5.0
        print(f"DEBUG: First-gen bonus: +5 points")
    else:
        print(f"DEBUG: No first-gen bonus (student: {student_quiz.is_first_generation}, consultant: {consultant_quiz.is_first_generation})")
    
    # Additional demographic matching bonuses
    # Income bracket matching (consultants from similar backgrounds can better relate)
    if (student_quiz.family_income_bracket and consultant_quiz.family_income_bracket and 
        student_quiz.family_income_bracket == consultant_quiz.family_income_bracket):
        score += 3.0
        print(f"DEBUG: Income bracket match: +3 points")
    else:
        print(f"DEBUG: No income bracket match")
    
    # Citizenship status matching (international students might prefer international consultants)
    if (student_quiz.citizenship_status and consultant_quiz.citizenship_status and 
        student_quiz.citizenship_status == consultant_quiz.citizenship_status):
        score += 2.0
        print(f"DEBUG: Citizenship status match: +2 points")
    else:
        print(f"DEBUG: No citizenship status match")
    
    # Underrepresented group matching (students from underrepresented groups might prefer consultants who understand their background)
    if (student_quiz.is_underrepresented_group and consultant_quiz.is_underrepresented_group and 
        student_quiz.is_underrepresented_group == consultant_quiz.is_underrepresented_group):
        score += 3.0
        print(f"DEBUG: Underrepresented group match: +3 points")
    else:
        print(f"DEBUG: No underrepresented group match")
    
    print(f"DEBUG: Final score: {score} points")
    
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
            score = calculate_match_score(quiz_response, consultant_quiz, application.major_category, application.major)
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

def match_single_application(application_id: int, db: Session):
    """Match a single college application with the best available consultant"""
    from app.db.models import CollegeApplication, Student, Consultant, ConsultantMatchingQuizResponse, StudentMatchingQuizResponse
    
    # Get the application
    application = db.get(CollegeApplication, application_id)
    if not application:
        raise ValueError("Application not found")
    
    # Get the student and their quiz responses
    student = db.get(Student, application.student_id)
    if not student:
        raise ValueError("Student not found")
    
    student_quiz = db.exec(
        select(StudentMatchingQuizResponse)
        .where(StudentMatchingQuizResponse.student_id == student.id)
    ).first()
    
    if not student_quiz:
        raise ValueError("Student quiz responses not found")
    
    # Get all consultants with quiz responses
    consultants = db.exec(
        select(Consultant)
        .join(ConsultantMatchingQuizResponse)
    ).all()
    
    if not consultants:
        raise ValueError("No consultants available for matching")
    
    # Find the best consultant for this application
    best_consultant = None
    best_score = 0.0
    
    for consultant in consultants:
        consultant_quiz = db.exec(
            select(ConsultantMatchingQuizResponse)
            .where(ConsultantMatchingQuizResponse.consultant_id == consultant.id)
        ).first()
        
        if consultant_quiz:
            score = calculate_match_score(
                student_quiz, 
                consultant_quiz, 
                application.major_category, 
                application.major
            )
            
            if score > best_score:
                best_score = score
                best_consultant = consultant
    
    # Assign the best consultant to the application
    if best_consultant is not None:
        application.consultant_id = best_consultant.id
        application.match_score = best_score
        db.add(application)
        db.commit()
        return best_consultant
    
    return None

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