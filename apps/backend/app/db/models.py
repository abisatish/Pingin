from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: str  # "student" | "consultant"
    email: str
    hashed_password: str
    profiles: List["Profile"] = Relationship(back_populates="user")

class Profile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    blob: str  # JSON string
    user: "User" = Relationship(back_populates="profiles")

class Ping(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    consultant_id: Optional[int] = Field(default=None, foreign_key="user.id")
    college: str
    question: str
    status: str = "open"
    created_at: datetime = Field(default_factory=datetime.utcnow)


 ##All of this is to make the student's model to work##
#################################################################################################

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

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

# --- core student tables ------------------------------------------------------

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    registration_id: str                 # used until payment confirmed
    user_id: int = Field(unique=True)    # FK to auth user
    highschool_id: Optional[int] = Field(foreign_key="highschool.id")
    photo_url: Optional[str] = None
    paid: bool = Field(default=False)

    # relationships
    addresses: List["Address"] = Relationship(back_populates="student")
    transcripts: List["Transcript"] = Relationship(back_populates="student")
    quiz_answers: List["StudentQuizAnswer"] = Relationship(back_populates="student")
    college_apps: List["CollegeApplication"] = Relationship(back_populates="student")

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

# --- matching quiz ------------------------------------------------------------

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
    college_id: int = Field(foreign_key="college.id")
    consultant_id: Optional[int] = Field(default=None, foreign_key="consultant.id")
    status: str = "draft"                  # draft, submitted, accepted, etc.

    student: "Student" = Relationship(back_populates="college_apps")
    college: "College" = Relationship()
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

    application: "CollegeApplication" = Relationship(back_populates="pings")
