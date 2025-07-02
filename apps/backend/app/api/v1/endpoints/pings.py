from fastapi import APIRouter, Depends, status, HTTPException, Header
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
from ..deps import get_db, get_current_user, get_current_role, get_current_consultant
from app.db.models import Ping, CollegeApplication, Suggestion
from app.schemas.ping import PingCreate

router = APIRouter(prefix="/pings", tags=["pings"])

class SuggestionCreate(BaseModel):
    ping_id: int
    type: str
    original_text: str
    suggested_text: str
    comment: str
    author_id: int

# list
@router.get("/", response_model=list[dict])
def list_pings(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all pings for the current user with application context"""
    pings = db.exec(
        select(Ping)
        .where(Ping.student_id == current_user.id)
        .order_by(Ping.created_at.desc())
    ).all()
    
    # Get application details for each ping
    ping_data = []
    for ping in pings:
        application = db.get(CollegeApplication, ping.application_id)
        ping_data.append({
            "id": ping.id,
            "question": ping.question,
            "status": ping.status,
            "answer": ping.answer,
            "created_at": ping.created_at,
            "application_id": ping.application_id,
            "application": {
                "college_name": application.college_name if application else "Unknown College",
                "major": application.major if application else "Unknown Major"
            } if application else None
        })
    
    return ping_data

# get single ping
@router.get("/{ping_id}", response_model=dict)
def get_ping(
    ping_id: int,
    role: str = Depends(get_current_role),
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    ping = db.get(Ping, ping_id)
    if not ping:
        raise HTTPException(status_code=404, detail="Ping not found")

    if role == "student":
        current_user = get_current_user(authorization, db)
        if ping.student_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this ping")
    elif role == "consultant":
        current_user = get_current_consultant(authorization, db)
        if ping.consultant_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this ping")
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view this ping")

    # Get application details
    application = db.get(CollegeApplication, ping.application_id)
    # Get essay by essay_id
    essay = None
    if ping.essay_id:
        from app.db.models import EssayResponse
        essay = db.get(EssayResponse, ping.essay_id)
    # Get suggestions
    suggestions = db.exec(
        select(Suggestion)
        .where(Suggestion.ping_id == ping.id)
        .order_by(Suggestion.created_at.desc())
    ).all()
    return {
        "id": ping.id,
        "question": ping.question,
        "status": ping.status,
        "answer": ping.answer,
        "created_at": ping.created_at.isoformat(),
        "application_id": ping.application_id,
        "application": {
            "college_name": application.college_name if application else "Unknown College",
            "major": application.major if application else "Unknown Major"
        } if application else None,
        "essay": {
            "id": essay.id,
            "prompt": essay.prompt,
            "response": essay.response
        } if essay else None,
        "suggestions": [
            {
                "id": s.id,
                "type": s.type,
                "originalText": s.original_text,
                "suggestedText": s.suggested_text,
                "comment": s.comment,
                "author": "Consultant",  # This would come from consultant lookup
                "timestamp": s.created_at.isoformat(),
                "accepted": s.accepted
            } for s in suggestions
        ]
    }

# create
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=Ping)
def create_ping(payload: PingCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get student_id from the authenticated user instead of payload
    ping_data = payload.dict()
    ping_data['student_id'] = current_user.id
    ping = Ping(**ping_data)
    db.add(ping)
    db.commit()
    db.refresh(ping)
    return ping

# Suggestion endpoints
@router.post("/{ping_id}/suggestions", response_model=dict)
def create_suggestion(
    ping_id: int,
    suggestion: SuggestionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new suggestion for a ping"""
    # Check if ping exists and user has access
    ping = db.get(Ping, ping_id)
    if not ping:
        raise HTTPException(status_code=404, detail="Ping not found")
    
    # For now, allow any authenticated user to create suggestions
    # In a real app, you'd check if the user is a consultant
    
    new_suggestion = Suggestion(
        ping_id=ping_id,
        author_id=suggestion.author_id,
        type=suggestion.type,
        original_text=suggestion.original_text,
        suggested_text=suggestion.suggested_text,
        comment=suggestion.comment
    )
    
    db.add(new_suggestion)
    db.commit()
    db.refresh(new_suggestion)
    
    return {
        "id": new_suggestion.id,
        "type": new_suggestion.type,
        "originalText": new_suggestion.original_text,
        "suggestedText": new_suggestion.suggested_text,
        "comment": new_suggestion.comment,
        "timestamp": new_suggestion.created_at.isoformat(),
        "accepted": new_suggestion.accepted
    }

@router.post("/{ping_id}/suggestions/{suggestion_id}/accept")
def accept_suggestion(
    ping_id: int,
    suggestion_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept a suggestion"""
    suggestion = db.get(Suggestion, suggestion_id)
    if not suggestion or suggestion.ping_id != ping_id:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    # Check if user owns the ping
    ping = db.get(Ping, ping_id)
    if not ping or ping.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this suggestion")
    
    suggestion.accepted = True
    db.add(suggestion)
    db.commit()
    
    return {"message": "Suggestion accepted"}

@router.post("/{ping_id}/suggestions/{suggestion_id}/reject")
def reject_suggestion(
    ping_id: int,
    suggestion_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject a suggestion"""
    suggestion = db.get(Suggestion, suggestion_id)
    if not suggestion or suggestion.ping_id != ping_id:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    # Check if user owns the ping
    ping = db.get(Ping, ping_id)
    if not ping or ping.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to reject this suggestion")
    
    # Delete the suggestion
    db.delete(suggestion)
    db.commit()
    
    return {"message": "Suggestion rejected"}
