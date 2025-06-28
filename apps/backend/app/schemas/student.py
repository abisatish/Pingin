from typing import Optional, List
from sqlmodel import SQLModel
from datetime import datetime

class StudentRead(SQLModel):
    id: int
    registration_id: str
    user_id: int
    highschool_id: Optional[int] = None
    photo_url: Optional[str] = None
    paid: bool
    email: str
    name: str
    gender: Optional[str] = None
    family_income_bracket: Optional[str] = None
    is_first_generation: Optional[bool] = None
    citizenship_status: Optional[str] = None
    is_underrepresented_group: Optional[str] = None
    quiz_completed: bool

class MatchingQuizRequest(SQLModel):
    # Academic Interests / Background
    passionate_subjects: List[str]
    academic_competitions: List[str]
    has_published_research: bool
    extracurricular_activities: List[str]
    
    # Demographics (Optional)
    gender: Optional[str] = None
    family_income_bracket: Optional[str] = None
    is_first_generation: Optional[bool] = None
    citizenship_status: Optional[str] = None
    is_underrepresented_group: Optional[str] = None
    
    # Additional fields
    other_subjects: Optional[str] = None
    other_activities: Optional[str] = None

class MatchingQuizResponse(SQLModel):
    id: int
    student_id: int
    passionate_subjects: List[str]
    academic_competitions: List[str]
    has_published_research: bool
    extracurricular_activities: List[str]
    gender: Optional[str] = None
    family_income_bracket: Optional[str] = None
    is_first_generation: Optional[bool] = None
    citizenship_status: Optional[str] = None
    is_underrepresented_group: Optional[str] = None
    other_subjects: Optional[str] = None
    other_activities: Optional[str] = None
    created_at: datetime
    updated_at: datetime