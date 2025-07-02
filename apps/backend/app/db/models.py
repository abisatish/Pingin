from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from sqlalchemy import BigInteger, Column, JSON
from enum import Enum

# Enums for better data consistency
class AcademicCompetition(str, Enum):
    USACO = "USACO (Informatics Olympiad)"
    ISEF = "ISEF (Science & Engineering Fair)"
    AMC_AIME = "AMC / AIME (Math Olympiad)"
    SCIENCE_OLYMPIAD = "Science Olympiad"
    DECA = "DECA"
    MODEL_UN = "Model UN"
    FIRST_ROBOTICS = "FIRST Robotics"
    INTEL_STS = "Intel STS / Regeneron"

class Subject(str, Enum):
    MATHEMATICS = "Mathematics"
    COMPUTER_SCIENCE = "Computer Science"
    BIOLOGY = "Biology"
    CHEMISTRY = "Chemistry"
    PHYSICS = "Physics"
    ENVIRONMENTAL_SCIENCE = "Environmental Science"
    ENGINEERING = "Engineering"
    ECONOMICS = "Economics"
    POLITICAL_SCIENCE = "Political Science"
    HISTORY = "History"
    LITERATURE_ENGLISH = "Literature / English"
    PHILOSOPHY = "Philosophy"
    PSYCHOLOGY = "Psychology"
    SOCIOLOGY = "Sociology"
    ART_HISTORY = "Art / Art History"
    MUSIC_THEORY = "Music Theory / Performance"
    FOREIGN_LANGUAGES = "Foreign Languages (e.g., Spanish, French, Chinese)"
    BUSINESS_ENTREPRENEURSHIP = "Business / Entrepreneurship"
    LAW_PRE_LAW = "Law / Pre-Law"
    EDUCATION_TEACHING = "Education / Teaching"

class ExtracurricularActivity(str, Enum):
    VARSITY_ATHLETICS = "Varsity Athletics"
    DEBATE_SPEECH = "Debate or Speech"
    PERFORMING_ARTS = "Performing Arts (e.g., Band, Theater)"
    VOLUNTEERING = "Volunteering / Community Service"
    ENTREPRENEURSHIP = "Entrepreneurship / Startup Projects"
    STUDENT_GOVERNMENT = "Student Government"

class IncomeBracket(str, Enum):
    UNDER_50K = "<$50,000"
    FIFTY_TO_100K = "$50,000–$100,000"
    HUNDRED_TO_200K = "$100,000–$200,000"
    OVER_200K = "$200,000+"
    PREFER_NOT_TO_SAY = "Prefer not to say"

class CitizenshipStatus(str, Enum):
    US_CITIZEN = "U.S. Citizen"
    US_PERMANENT_RESIDENT = "U.S. Permanent Resident"
    INTERNATIONAL = "International Student"

class UnderrepresentedGroup(str, Enum):
    YES = "Yes"
    NO = "No"
    PREFER_NOT_TO_SAY = "Prefer not to say"

class CollegeApplicationStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WAITLISTED = "waitlisted"
    DEFERRED = "deferred"

# Major categories for better organization
class MajorCategory(str, Enum):
    STEM = "STEM"
    HUMANITIES = "Humanities"
    SOCIAL_SCIENCES = "Social Sciences"
    BUSINESS = "Business"
    ARTS = "Arts"
    HEALTH = "Health"
    EDUCATION = "Education"
    OTHER = "Other"

# --- reference tables ---------------------------------------------------------

class HighSchool(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    city: str
    state: str
    country: str

class College(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    common_app_code: Optional[str] = None

class Consultant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    name: str
    bio: Optional[str] = None
    tags: Optional[str] = None          # JSON string of interests/experiences
    password_hash: str        

# --- core student tables ------------------------------------------------------

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    registration_id: str                 # used until payment confirmed
    user_id: int = Field(sa_column=Column(BigInteger(), unique=True))    # FK to auth user - BIGINT for timestamp IDs
    highschool_id: Optional[int] = Field(foreign_key="highschool.id")
    photo_url: Optional[str] = None
    paid: bool = Field(default=False)
    email: str = Field(unique=True)
    password_hash: str
    name: str
    
    # New demographic fields
    gender: Optional[str] = None
    family_income_bracket: Optional[IncomeBracket] = None
    is_first_generation: Optional[bool] = None
    citizenship_status: Optional[CitizenshipStatus] = None
    is_underrepresented_group: Optional[UnderrepresentedGroup] = None
    quiz_completed: bool = Field(default=False)  # Track if student has completed the matching quiz
    college_selection_completed: bool = Field(default=False)  # Track if student has selected colleges
    matching_completed: bool = Field(default=False)  # Track if matching has been completed

    # relationships
    addresses: List["Address"] = Relationship(back_populates="student")
    transcripts: List["Transcript"] = Relationship(back_populates="student")
    quiz_answers: List["StudentQuizAnswer"] = Relationship(back_populates="student")
    matching_quiz_responses: List["StudentMatchingQuizResponse"] = Relationship(back_populates="student")
    college_apps: List["CollegeApplication"] = Relationship(back_populates="student")
    tasks: List["Task"] = Relationship(back_populates="student")

class Address(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    zip_code: str
    country: str = "USA"
    type: str = "home"                    # home, mailing, etc.

    student: "Student" = Relationship(back_populates="addresses")

class Transcript(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    gpa: Optional[float] = None
    pdf_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    student: "Student" = Relationship(back_populates="transcripts")

# --- comprehensive matching quiz ------------------------------------------------------------

class StudentMatchingQuizResponse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    
    # Academic background - using enums for consistency
    passionate_subjects: List[Subject] = Field(sa_column=Column(JSON))  # List of Subject enum values
    academic_competitions: List[AcademicCompetition] = Field(sa_column=Column(JSON))  # List of AcademicCompetition enum values
    has_published_research: bool
    extracurricular_activities: List[ExtracurricularActivity] = Field(sa_column=Column(JSON))  # List of ExtracurricularActivity enum values
    other_subjects: Optional[str] = None
    other_activities: Optional[str] = None
    
    # Demographics (optional)
    gender: Optional[str] = None
    family_income_bracket: Optional[IncomeBracket] = None
    is_first_generation: Optional[bool] = None
    citizenship_status: Optional[CitizenshipStatus] = None
    is_underrepresented_group: Optional[UnderrepresentedGroup] = None
    
    # Timestamps
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # relationships
    student: "Student" = Relationship(back_populates="matching_quiz_responses")

# --- legacy matching quiz (keeping for backward compatibility) ------------------------------------------------------------

class QuizQuestion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    tag: str                               # e.g. "usaco", "debate", etc.

class StudentQuizAnswer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    question_id: int = Field(foreign_key="quizquestion.id")
    answer: str                            # yes/no or text

    student: "Student" = Relationship(back_populates="quiz_answers")
    question: "QuizQuestion" = Relationship()

# --- application & essays -----------------------------------------------------

class CollegeApplication(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    college_name: str = Field(index=True)  # Store college name directly
    major: str = Field(index=True)  # Store major name directly
    major_category: Optional[MajorCategory] = None  # For easier filtering/matching
    consultant_id: Optional[int] = Field(default=None, foreign_key="consultant.id")
    status: CollegeApplicationStatus = Field(default=CollegeApplicationStatus.DRAFT)
    match_score: Optional[float] = None  # Store the matching score for this application
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    student: "Student" = Relationship(back_populates="college_apps")
    consultant: Optional["Consultant"] = Relationship()
    essays: List["EssayResponse"] = Relationship(back_populates="application")
    pings: List["Ping"] = Relationship(back_populates="application")

class EssayResponse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    application_id: int = Field(foreign_key="collegeapplication.id")
    prompt: str
    response: str
    last_edited: datetime = Field(default_factory=datetime.utcnow)

    application: "CollegeApplication" = Relationship(back_populates="essays")

# --- ping workflow ------------------------------------------------------------

class Ping(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    application_id: int = Field(foreign_key="collegeapplication.id")
    student_id: int = Field(foreign_key="student.id")
    consultant_id: Optional[int] = Field(default=None, foreign_key="consultant.id")
    question: str
    status: str = "open"                   # open, answered, closed
    answer: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    essay_id: Optional[int] = Field(default=None, foreign_key="essayresponse.id")

    application: "CollegeApplication" = Relationship(back_populates="pings")
    comments: List["Comment"] = Relationship(back_populates="ping")
    suggestions: List["Suggestion"] = Relationship(back_populates="ping")
    essay: Optional["EssayResponse"] = Relationship()

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ping_id: int            = Field(foreign_key="ping.id")          # which Ping
    author_id: int          = Field(foreign_key="consultant.id")    # or student.id
    anchor_start: int       # character offset in essay.response
    anchor_end: int
    body: str
    resolved: bool          = Field(default=False)
    created_at: datetime    = Field(default_factory=datetime.utcnow)

    ping:      "Ping"       = Relationship(back_populates="comments")

class Suggestion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ping_id: int = Field(foreign_key="ping.id")
    author_id: int = Field(foreign_key="consultant.id")
    type: str = Field(default="grammar")  # grammar, style, content, structure
    original_text: str
    suggested_text: str
    comment: str
    accepted: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    ping: "Ping" = Relationship(back_populates="suggestions")

# Popular colleges for selection
POPULAR_COLLEGES = [
    "Harvard University",
    "Stanford University",
    "Massachusetts Institute of Technology (MIT)",
    "Yale University",
    "Princeton University",
    "Columbia University",
    "University of Pennsylvania",
    "Duke University",
    "Brown University",
    "Cornell University",
    "University of California, Berkeley",
    "University of California, Los Angeles (UCLA)",
    "University of Michigan",
    "University of Virginia",
    "University of North Carolina at Chapel Hill",
    "New York University (NYU)",
    "University of Chicago",
    "Northwestern University",
    "Johns Hopkins University",
    "Carnegie Mellon University",
    "University of Southern California (USC)",
    "Georgetown University",
    "Vanderbilt University",
    "Rice University",
    "Washington University in St. Louis",
    "Emory University",
    "University of Notre Dame",
    "Tufts University",
    "Boston University",
    "University of California, San Diego",
    "University of California, Davis",
    "University of California, Irvine",
    "University of California, Santa Barbara",
    "University of California, Santa Cruz",
    "University of Washington",
    "University of Texas at Austin",
    "University of Wisconsin-Madison",
    "University of Illinois at Urbana-Champaign",
    "Purdue University",
    "Indiana University Bloomington",
    "Ohio State University",
    "University of Florida",
    "University of Georgia",
    "University of Maryland",
    "Rutgers University",
    "Penn State University",
    "University of Pittsburgh",
    "Boston College",
    "Villanova University",
    "Wake Forest University",
    "University of Miami",
    "Tulane University",
    "University of Rochester",
    "Case Western Reserve University",
    "Brandeis University",
    "Lehigh University",
    "Rensselaer Polytechnic Institute",
    "Worcester Polytechnic Institute",
    "Stevens Institute of Technology",
    "Cooper Union",
    "Harvey Mudd College",
    "California Institute of Technology (Caltech)",
    "Williams College",
    "Amherst College",
    "Swarthmore College",
    "Pomona College",
    "Bowdoin College",
    "Middlebury College",
    "Carleton College",
    "Grinnell College",
    "Haverford College",
    "Davidson College",
    "Colgate University",
    "Hamilton College",
    "Bates College",
    "Colby College",
    "Bucknell University",
    "Lafayette College",
    "Franklin & Marshall College",
    "Dickinson College",
    "Gettysburg College",
    "Muhlenberg College",
    "Juniata College",
    "Elizabethtown College",
    "Albright College",
    "Lebanon Valley College",
    "Messiah University",
    "York College of Pennsylvania",
    "Millersville University",
    "Shippensburg University",
    "Kutztown University",
    "West Chester University",
    "Bloomsburg University",
    "East Stroudsburg University",
    "Indiana University of Pennsylvania",
    "Slippery Rock University",
    "California University of Pennsylvania",
    "Clarion University",
    "Edinboro University",
    "Lock Haven University",
    "Mansfield University",
    "Cheyney University",
    "Lincoln University",
    "Penn State University (various campuses)",
    "Temple University",
    "University of Pittsburgh (various campuses)",
    "Drexel University",
    "Saint Joseph's University",
    "La Salle University",
    "Temple University",
    "University of the Sciences",
    "Philadelphia University",
    "Arcadia University",
    "Cabrini University",
    "Chestnut Hill College",
    "Delaware Valley University",
    "Eastern University",
    "Gwynedd Mercy University",
    "Holy Family University",
    "Immaculata University",
    "Keystone College",
    "King's College",
    "Lackawanna College",
    "Lancaster Bible College",
    "Lancaster Theological Seminary",
    "Lebanon Valley College",
    "Lincoln University",
    "Lock Haven University",
    "Lycoming College",
    "Mansfield University",
    "Marywood University",
    "Mercyhurst University",
    "Messiah University",
    "Millersville University",
    "Misericordia University",
    "Moravian College",
    "Mount Aloysius College",
    "Muhlenberg College",
    "Neumann University",
    "Penn State University",
    "Philadelphia College of Osteopathic Medicine",
    "Point Park University",
    "Robert Morris University",
    "Rosemont College",
    "Saint Francis University",
    "Saint Joseph's University",
    "Saint Vincent College",
    "Seton Hill University",
    "Shippensburg University",
    "Slippery Rock University",
    "Susquehanna University",
    "Swarthmore College",
    "Temple University",
    "Thiel College",
    "University of Pennsylvania",
    "University of Pittsburgh",
    "University of Scranton",
    "Ursinus College",
    "Villanova University",
    "Washington & Jefferson College",
    "Waynesburg University",
    "West Chester University",
    "Westminster College",
    "Widener University",
    "Wilkes University",
    "Wilson College",
    "York College of Pennsylvania"
]

# Popular majors list
POPULAR_MAJORS = [
    # STEM
    "Computer Science",
    "Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Biochemistry",
    "Neuroscience",
    "Data Science",
    "Statistics",
    "Applied Mathematics",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Biomedical Engineering",
    "Computer Engineering",
    "Aerospace Engineering",
    "Environmental Engineering",
    "Materials Science",
    "Astronomy",
    "Geology",
    "Meteorology",
    "Oceanography",
    "Psychology",
    "Cognitive Science",
    
    # Humanities
    "English",
    "History",
    "Philosophy",
    "Classics",
    "Religious Studies",
    "Comparative Literature",
    "Creative Writing",
    "Linguistics",
    "Art History",
    "Music",
    "Theater",
    "Film Studies",
    "Dance",
    "Visual Arts",
    "Architecture",
    "Design",
    
    # Social Sciences
    "Economics",
    "Political Science",
    "Sociology",
    "Anthropology",
    "Psychology",
    "International Relations",
    "Public Policy",
    "Urban Studies",
    "Gender Studies",
    "African American Studies",
    "Asian American Studies",
    "Latin American Studies",
    "Middle Eastern Studies",
    "European Studies",
    "Global Studies",
    "Environmental Studies",
    
    # Business
    "Business Administration",
    "Finance",
    "Accounting",
    "Marketing",
    "Management",
    "Entrepreneurship",
    "International Business",
    "Supply Chain Management",
    "Human Resources",
    "Real Estate",
    "Hospitality Management",
    "Sports Management",
    
    # Health
    "Pre-Medicine",
    "Pre-Dentistry",
    "Pre-Pharmacy",
    "Pre-Veterinary",
    "Nursing",
    "Public Health",
    "Health Sciences",
    "Kinesiology",
    "Nutrition",
    "Physical Therapy",
    "Occupational Therapy",
    
    # Education
    "Education",
    "Elementary Education",
    "Secondary Education",
    "Special Education",
    "Early Childhood Education",
    "Educational Psychology",
    "Curriculum and Instruction",
    
    # Other
    "Communications",
    "Journalism",
    "Public Relations",
    "Advertising",
    "Media Studies",
    "Information Science",
    "Library Science",
    "Criminal Justice",
    "Social Work",
    "Environmental Science",
    "Sustainability",
    "Agriculture",
    "Forestry",
    "Veterinary Science",
    "Veterinary Medicine",
]

class ConsultantMatchingQuizResponse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    consultant_id: int = Field(foreign_key="consultant.id")
    
    # Academic background - using enums for consistency
    passionate_subjects: List[Subject] = Field(sa_column=Column(JSON))  # List of Subject enum values
    academic_competitions: List[AcademicCompetition] = Field(sa_column=Column(JSON))  # List of AcademicCompetition enum values
    has_published_research: Optional[bool] = None
    extracurricular_activities: List[ExtracurricularActivity] = Field(sa_column=Column(JSON))  # List of ExtracurricularActivity enum values
    other_subjects: Optional[str] = None
    other_activities: Optional[str] = None
    
    # Demographics (optional) - matching student model
    gender: Optional[str] = None
    family_income_bracket: Optional[IncomeBracket] = None
    is_first_generation: Optional[bool] = None  # Changed from first_generation to match student model
    citizenship_status: Optional[CitizenshipStatus] = None
    is_underrepresented_group: Optional[UnderrepresentedGroup] = None
    
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

# Task status enum
class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"

# Task priority enum
class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Task model for upcoming tasks functionality
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    category: Optional[str] = None  # e.g., "essay", "application", "interview", "recommendation"
    related_application_id: Optional[int] = Field(default=None, foreign_key="collegeapplication.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    # relationships
    student: "Student" = Relationship(back_populates="tasks")
    application: Optional["CollegeApplication"] = Relationship()
