from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Path, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..deps import get_db, get_current_role
from app.db.models import EssayResponse, Comment

router = APIRouter(tags=["review"])


# ─── schemas ─────────────────────────────────────────────────────────
class EssayRead(BaseModel):
    id: int
    prompt: str
    response: str
    last_edited: datetime


class EssayUpdate(BaseModel):
    response: str


class CommentCreate(BaseModel):
    body: str


class CommentRead(BaseModel):
    id: int
    body: str
    author_id: int
    resolved: bool
    created_at: datetime


# ─── helpers ─────────────────────────────────────────────────────────
def _essay_or_404(db: Session, essay_id: int) -> EssayResponse:
    e = db.get(EssayResponse, essay_id)
    if not e:
        raise HTTPException(404, "Essay not found")
    return e


# ─── routes ──────────────────────────────────────────────────────────
@router.get("/review/{essay_id}", response_model=EssayRead)
def fetch_essay(
    essay_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    _: str = Depends(get_current_role),        # just validates token
):
    return _essay_or_404(db, essay_id)


@router.put("/review/{essay_id}", response_model=EssayRead)
def save_essay(
    essay_id: int,
    patch: EssayUpdate,
    role: str = Depends(get_current_role),
    db: Session = Depends(get_db),
):
    if role != "student":
        raise HTTPException(403, "Consultants cannot edit essay text")

    essay = _essay_or_404(db, essay_id)
    essay.response = patch.response
    essay.last_edited = datetime.utcnow()
    db.add(essay)
    db.commit()
    db.refresh(essay)
    return essay


@router.get("/review/{essay_id}/comments", response_model=List[CommentRead])
def list_comments(
    essay_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_role),
):
    stmt = (
        select(Comment)
        .join_from(Comment, EssayResponse, EssayResponse.id == essay_id)
        .where(Comment.ping.has(application_id=EssayResponse.application_id))
    )
    return db.exec(stmt).all()


@router.post("/review/{essay_id}/comments", response_model=CommentRead)
def add_comment(
    essay_id: int,
    payload: CommentCreate,
    role: str = Depends(get_current_role),
    db: Session = Depends(get_db),
):
    if role not in ("consultant", "student"):
        raise HTTPException(403, "Only consultants or students may comment")
    essay = _essay_or_404(db, essay_id)
    c = Comment(
        body=payload.body,
        ping_id=essay.application.pings[0].id,   # first ping for now
        author_id=0,                             # unknown user id for MVP
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c
