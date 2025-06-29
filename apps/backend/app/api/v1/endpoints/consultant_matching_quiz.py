from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime

from ..deps import get_db, get_current_consultant, get_current_role
from app.db.models import Consultant, ConsultantMatchingQuizResponse

router = APIRouter(prefix="/consultant-matching-quiz", tags=["consultant-matching-quiz"])

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
    quiz_data: ConsultantMatchingQuizResponse,
    db: Session = Depends(get_db),
    current_user: Consultant = Depends(get_current_consultant)
):
    existing_response = db.exec(
        select(ConsultantMatchingQuizResponse).where(
            ConsultantMatchingQuizResponse.consultant_id == current_user.id
        )
    ).first()
    if existing_response:
        # Update existing response
        for field, value in quiz_data.dict(exclude_unset=True).items():
            setattr(existing_response, field, value)
        existing_response.updated_at = datetime.utcnow()
        response = existing_response
    else:
        new_response = ConsultantMatchingQuizResponse(
            consultant_id=current_user.id,
            **quiz_data.dict(exclude_unset=True)
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