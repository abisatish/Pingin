from fastapi import APIRouter, Depends, status, HTTPException, Header, Body
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
from ..deps import get_db, get_current_user, get_current_role, get_current_consultant
from app.db.models import Ping, CollegeApplication, Suggestion, Comment, Strikethrough, EssayResponse, Addition
from app.schemas.ping import PingCreate
from app.schemas.comments import CommentCreate, CommentRead
from datetime import datetime

router = APIRouter(prefix="/pings", tags=["pings"])

class SuggestionCreate(BaseModel):
    ping_id: int
    type: str
    original_text: str
    suggested_text: str
    comment: str
    author_id: int

class StrikethroughCreate(BaseModel):
    anchor_start: int
    anchor_end: int
    text: str

class AdditionCreate(BaseModel):
    anchor_start: int
    text: str

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
                "author_role": s.author_role,
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
    role: str = Depends(get_current_role),
    db: Session = Depends(get_db),
    authorization: str = Header(...),
):
    """Create a new suggestion for a ping"""
    if role not in ["consultant", "student"]:
        raise HTTPException(403, "Only consultants and students may create suggestions")
    
    # Check if ping exists and user has access
    ping = db.get(Ping, ping_id)
    if not ping:
        raise HTTPException(status_code=404, detail="Ping not found")
    
    # Get the appropriate user based on role
    if role == "consultant":
        current_consultant = get_current_consultant(authorization, db)
        author_id = current_consultant.id
    else:  # role == "student"
        current_student = get_current_user(authorization, db)
        author_id = current_student.id
    
    # Create the suggestion
    new_suggestion = Suggestion(
        ping_id=ping_id,
        author_id=author_id,
        author_role=role,
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
    role: str = Depends(get_current_role),
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """Accept a suggestion"""
    suggestion = db.get(Suggestion, suggestion_id)
    if not suggestion or suggestion.ping_id != ping_id:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    # Check permissions: can only accept items created by the opposite role
    if role == "student" and suggestion.author_role != "consultant":
        raise HTTPException(status_code=403, detail="Students can only accept consultant suggestions")
    elif role == "consultant" and suggestion.author_role != "student":
        raise HTTPException(status_code=403, detail="Consultants can only accept student suggestions")
    
    suggestion.accepted = True
    db.add(suggestion)
    db.commit()
    
    return {"message": "Suggestion accepted"}

@router.post("/{ping_id}/suggestions/{suggestion_id}/reject")
def reject_suggestion(
    ping_id: int,
    suggestion_id: int,
    role: str = Depends(get_current_role),
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """Reject a suggestion"""
    suggestion = db.get(Suggestion, suggestion_id)
    if not suggestion or suggestion.ping_id != ping_id:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    # Both roles can reject any suggestion
    if role not in ["consultant", "student"]:
        raise HTTPException(status_code=403, detail="Only consultants and students may reject suggestions")
    
    # Delete the suggestion
    db.delete(suggestion)
    db.commit()
    
    return {"message": "Suggestion rejected"}

# Comments endpoints
@router.get("/{ping_id}/comments", response_model=List[CommentRead])
def get_comments_for_ping(
    ping_id: int,
    role: str = Depends(get_current_role),
    db: Session = Depends(get_db),
):
    print(f"DEBUG: Fetching comments for ping {ping_id}")
    print(f"DEBUG: Role: {role}")
    
    comments = db.exec(select(Comment).where(Comment.ping_id == ping_id)).all()
    print(f"DEBUG: Found {len(comments)} comments")
    
    for comment in comments:
        print(f"DEBUG: Comment {comment.id}: body='{comment.body}', anchor_start={comment.anchor_start}, anchor_end={comment.anchor_end}")
    
    return comments

@router.post("/{ping_id}/comments", response_model=CommentRead)
def add_comment_to_ping(
    ping_id: int,
    payload: CommentCreate,
    role: str = Depends(get_current_role),
    db: Session = Depends(get_db),
    authorization: str = Header(...),
):
    print(f"DEBUG: Creating comment for ping {ping_id}")
    print(f"DEBUG: Role: {role}")
    print(f"DEBUG: Payload: {payload}")
    
    if role not in ["consultant", "student"]:
        raise HTTPException(403, "Only consultants and students may comment")
    
    ping = db.get(Ping, ping_id)
    if not ping:
        raise HTTPException(status_code=404, detail="Ping not found")
    
    # Get the appropriate user based on role
    if role == "consultant":
        current_consultant = get_current_consultant(authorization, db)
        author_id = current_consultant.id
        print(f"DEBUG: Consultant ID: {author_id}")
    else:  # role == "student"
        current_student = get_current_user(authorization, db)
        author_id = current_student.id
        print(f"DEBUG: Student ID: {author_id}")
    
    # Ensure body is not None (empty string is fine for highlights)
    body = payload.body if payload.body is not None else ""
    
    # Create the comment
    comment = Comment(
        ping_id=ping_id,
        author_id=author_id,
        author_role=role,
        anchor_start=payload.anchor_start,
        anchor_end=payload.anchor_end,
        body=body
    )
    
    print(f"DEBUG: Creating comment with body: '{body}', anchor_start: {payload.anchor_start}, anchor_end: {payload.anchor_end}")
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    print(f"DEBUG: Comment created with ID: {comment.id}")
    return comment

@router.post("/{ping_id}/comments/{comment_id}/resolve")
def resolve_comment(
    ping_id: int,
    comment_id: int,
    role: str = Depends(get_current_role),
    db: Session = Depends(get_db),
):
    if role not in ["consultant", "student"]:
        raise HTTPException(403, "Only consultants and students may resolve comments")
    comment = db.get(Comment, comment_id)
    if not comment or comment.ping_id != ping_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment.resolved = True
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {"message": "Comment resolved"}

@router.patch("/{ping_id}/comments/{comment_id}", response_model=CommentRead)
def update_comment(
    ping_id: int,
    comment_id: int,
    payload: dict = Body(...),
    role: str = Depends(get_current_role),
    db: Session = Depends(get_db),
):
    if role not in ["consultant", "student"]:
        raise HTTPException(403, "Only consultants and students may update comments")
    comment = db.get(Comment, comment_id)
    if not comment or comment.ping_id != ping_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    if "body" in payload:
        comment.body = payload["body"]
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

# Strikethrough endpoints
@router.get("/{ping_id}/strikethroughs", response_model=List[dict])
def get_strikethroughs_for_ping(
    ping_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_current_role),
):
    sts = db.exec(select(Strikethrough).where(Strikethrough.ping_id == ping_id)).all()
    return [
        {
            "id": s.id,
            "anchor_start": s.anchor_start,
            "anchor_end": s.anchor_end,
            "text": s.text,
            "author_id": s.author_id,
            "author_role": s.author_role,
            "created_at": s.created_at.isoformat(),
        } for s in sts
    ]

@router.post("/{ping_id}/strikethroughs", response_model=dict)
def create_strikethrough(
    ping_id: int,
    payload: StrikethroughCreate,
    db: Session = Depends(get_db),
    role: str = Depends(get_current_role),
    authorization: str = Header(...),
):
    if role not in ["consultant", "student"]:
        raise HTTPException(403, "Only consultants and students may create strikethroughs")
    ping = db.get(Ping, ping_id)
    if not ping:
        raise HTTPException(status_code=404, detail="Ping not found")
    
    # Get the appropriate user based on role
    if role == "consultant":
        current_consultant = get_current_consultant(authorization, db)
        author_id = current_consultant.id
    else:  # role == "student"
        current_student = get_current_user(authorization, db)
        author_id = current_student.id
    
    s = Strikethrough(
        ping_id=ping_id,
        author_id=author_id,
        author_role=role,
        anchor_start=payload.anchor_start,
        anchor_end=payload.anchor_end,
        text=payload.text,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return {
        "id": s.id,
        "anchor_start": s.anchor_start,
        "anchor_end": s.anchor_end,
        "text": s.text,
        "author_id": s.author_id,
        "created_at": s.created_at.isoformat(),
    }

@router.post("/{ping_id}/strikethroughs/{strikethrough_id}/accept")
def accept_strikethrough(
    ping_id: int,
    strikethrough_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_current_role),
    authorization: str = Header(...),
):
    st = db.get(Strikethrough, strikethrough_id)
    if not st or st.ping_id != ping_id:
        raise HTTPException(status_code=404, detail="Strikethrough not found")
    
    # Check permissions: can only accept items created by the opposite role
    if role == "student" and st.author_role != "consultant":
        raise HTTPException(status_code=403, detail="Students can only accept consultant strikethroughs")
    elif role == "consultant" and st.author_role != "student":
        raise HTTPException(status_code=403, detail="Consultants can only accept student strikethroughs")
    
    ping = db.get(Ping, ping_id)
    if not ping:
        raise HTTPException(status_code=404, detail="Ping not found")
    essay = db.get(EssayResponse, ping.essay_id)
    if not essay:
        raise HTTPException(status_code=404, detail="Essay not found")
    
    # Calculate the length of text being removed
    deletion_length = st.anchor_end - st.anchor_start
    
    # Remove the text from the essay
    essay.response = essay.response[:st.anchor_start] + essay.response[st.anchor_end:]
    essay.last_edited = datetime.utcnow()
    db.add(essay)
    
    # Update anchor positions for all existing annotations that come after the deletion point
    # Update comments
    comments = db.exec(select(Comment).where(Comment.ping_id == ping_id)).all()
    for comment in comments:
        if comment.anchor_start >= st.anchor_end:
            comment.anchor_start -= deletion_length
            comment.anchor_end -= deletion_length
            db.add(comment)
        elif comment.anchor_start >= st.anchor_start and comment.anchor_end <= st.anchor_end:
            # Comment is completely within the deleted text, mark as resolved
            comment.resolved = True
            db.add(comment)
        elif comment.anchor_start < st.anchor_start and comment.anchor_end > st.anchor_start:
            # Comment overlaps with deletion, adjust end position
            comment.anchor_end = st.anchor_start
            db.add(comment)
    
    # Update strikethroughs
    strikethroughs = db.exec(select(Strikethrough).where(Strikethrough.ping_id == ping_id)).all()
    for other_st in strikethroughs:
        if other_st.id != st.id:
            if other_st.anchor_start >= st.anchor_end:
                other_st.anchor_start -= deletion_length
                other_st.anchor_end -= deletion_length
                db.add(other_st)
            elif other_st.anchor_start >= st.anchor_start and other_st.anchor_end <= st.anchor_end:
                # Strikethrough is completely within the deleted text, delete it
                db.delete(other_st)
            elif other_st.anchor_start < st.anchor_start and other_st.anchor_end > st.anchor_start:
                # Strikethrough overlaps with deletion, adjust end position
                other_st.anchor_end = st.anchor_start
                db.add(other_st)
    
    # Update additions
    additions = db.exec(select(Addition).where(Addition.ping_id == ping_id)).all()
    for addition in additions:
        if addition.anchor_start >= st.anchor_end:
            addition.anchor_start -= deletion_length
            db.add(addition)
        elif addition.anchor_start >= st.anchor_start and addition.anchor_start < st.anchor_end:
            # Addition is within the deleted text, delete it
            db.delete(addition)
    
    # Delete the accepted strikethrough
    db.delete(st)
    db.commit()
    return {"message": "Strikethrough accepted and essay updated"}

@router.post("/{ping_id}/strikethroughs/{strikethrough_id}/reject")
def reject_strikethrough(
    ping_id: int,
    strikethrough_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_current_role),
):
    st = db.get(Strikethrough, strikethrough_id)
    if not st or st.ping_id != ping_id:
        raise HTTPException(status_code=404, detail="Strikethrough not found")
    db.delete(st)
    db.commit()
    return {"message": "Strikethrough rejected and deleted"}

# Addition endpoints
@router.get("/{ping_id}/additions", response_model=List[dict])
def get_additions_for_ping(
    ping_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_current_role),
):
    additions = db.exec(select(Addition).where(Addition.ping_id == ping_id)).all()
    return [
        {
            "id": a.id,
            "anchor_start": a.anchor_start,
            "text": a.text,
            "author_id": a.author_id,
            "author_role": a.author_role,
            "accepted": a.accepted,
            "created_at": a.created_at.isoformat(),
        } for a in additions
    ]

@router.post("/{ping_id}/additions", response_model=dict)
def create_addition(
    ping_id: int,
    payload: AdditionCreate,
    db: Session = Depends(get_db),
    role: str = Depends(get_current_role),
    authorization: str = Header(...),
):
    if role not in ["consultant", "student"]:
        raise HTTPException(403, "Only consultants and students may create additions")
    ping = db.get(Ping, ping_id)
    if not ping:
        raise HTTPException(status_code=404, detail="Ping not found")
    
    # Get the appropriate user based on role
    if role == "consultant":
        current_consultant = get_current_consultant(authorization, db)
        author_id = current_consultant.id
    else:  # role == "student"
        current_student = get_current_user(authorization, db)
        author_id = current_student.id
    
    a = Addition(
        ping_id=ping_id,
        author_id=author_id,
        author_role=role,
        anchor_start=payload.anchor_start,
        text=payload.text,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return {
        "id": a.id,
        "anchor_start": a.anchor_start,
        "text": a.text,
        "author_id": a.author_id,
        "accepted": a.accepted,
        "created_at": a.created_at.isoformat(),
    }

@router.post("/{ping_id}/additions/{addition_id}/accept")
def accept_addition(
    ping_id: int,
    addition_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_current_role),
    authorization: str = Header(...),
):
    addition = db.get(Addition, addition_id)
    if not addition or addition.ping_id != ping_id:
        raise HTTPException(status_code=404, detail="Addition not found")
    
    # Check permissions: can only accept items created by the opposite role
    if role == "student" and addition.author_role != "consultant":
        raise HTTPException(status_code=403, detail="Students can only accept consultant additions")
    elif role == "consultant" and addition.author_role != "student":
        raise HTTPException(status_code=403, detail="Consultants can only accept student additions")
    
    ping = db.get(Ping, ping_id)
    if not ping:
        raise HTTPException(status_code=404, detail="Ping not found")
    essay = db.get(EssayResponse, ping.essay_id)
    if not essay:
        raise HTTPException(status_code=404, detail="Essay not found")
    
    # Insert the text into the essay
    essay.response = essay.response[:addition.anchor_start] + addition.text + essay.response[addition.anchor_start:]
    essay.last_edited = datetime.utcnow()
    db.add(essay)
    
    # Update anchor positions for all existing annotations that come after the insertion point
    insertion_length = len(addition.text)
    
    # Update comments
    comments = db.exec(select(Comment).where(Comment.ping_id == ping_id)).all()
    for comment in comments:
        if comment.anchor_start >= addition.anchor_start:
            comment.anchor_start += insertion_length
            comment.anchor_end += insertion_length
            db.add(comment)
    
    # Update strikethroughs
    strikethroughs = db.exec(select(Strikethrough).where(Strikethrough.ping_id == ping_id)).all()
    for st in strikethroughs:
        if st.anchor_start >= addition.anchor_start:
            st.anchor_start += insertion_length
            st.anchor_end += insertion_length
            db.add(st)
    
    # Update other additions (that come after this one)
    other_additions = db.exec(select(Addition).where(Addition.ping_id == ping_id)).all()
    for other_add in other_additions:
        if other_add.id != addition.id and other_add.anchor_start >= addition.anchor_start:
            other_add.anchor_start += insertion_length
            db.add(other_add)
    
    # Delete the accepted addition
    db.delete(addition)
    db.commit()
    return {"message": "Addition accepted and essay updated"}

@router.post("/{ping_id}/additions/{addition_id}/reject")
def reject_addition(
    ping_id: int,
    addition_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_current_role),
):
    addition = db.get(Addition, addition_id)
    if not addition or addition.ping_id != ping_id:
        raise HTTPException(status_code=404, detail="Addition not found")
    db.delete(addition)
    db.commit()
    return {"message": "Addition rejected and deleted"}
