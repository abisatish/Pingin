from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from ..deps import get_db, get_current_user
from app.db.models import Task, Student, TaskStatus, TaskPriority, CollegeApplication

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Pydantic models for request/response
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    category: Optional[str] = None
    related_application_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    category: Optional[str] = None
    related_application_id: Optional[int] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: TaskStatus
    priority: TaskPriority
    category: Optional[str] = None
    related_application_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    application_name: Optional[str] = None

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Get all tasks for the current student with optional filtering"""
    query = select(Task).where(Task.student_id == current_user.id)
    
    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    if category:
        query = query.where(Task.category == category)
    
    # Order by due date (nulls last), then priority, then created date
    query = query.order_by(Task.due_date.asc().nullslast(), Task.priority.desc(), Task.created_at.desc())
    
    tasks = db.exec(query).all()
    
    # Add application names to response
    result = []
    for task in tasks:
        task_dict = task.dict()
        if task.related_application_id:
            application = db.get(CollegeApplication, task.related_application_id)
            task_dict["application_name"] = application.college_name if application else None
        else:
            task_dict["application_name"] = None
        result.append(TaskResponse(**task_dict))
    
    return result

@router.post("/", response_model=TaskResponse)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Create a new task for the current student"""
    
    # Validate related application if provided
    if task_data.related_application_id:
        application = db.get(CollegeApplication, task_data.related_application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Related application not found")
        if application.student_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this application")
    
    task = Task(
        student_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        due_date=task_data.due_date,
        priority=task_data.priority,
        category=task_data.category,
        related_application_id=task_data.related_application_id
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Add application name to response
    task_dict = task.dict()
    if task.related_application_id:
        application = db.get(CollegeApplication, task.related_application_id)
        task_dict["application_name"] = application.college_name if application else None
    else:
        task_dict["application_name"] = None
    
    return TaskResponse(**task_dict)

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Get a specific task by ID"""
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    
    # Add application name to response
    task_dict = task.dict()
    if task.related_application_id:
        application = db.get(CollegeApplication, task.related_application_id)
        task_dict["application_name"] = application.college_name if application else None
    else:
        task_dict["application_name"] = None
    
    return TaskResponse(**task_dict)

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Update a specific task"""
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    
    # Validate related application if provided
    if task_data.related_application_id:
        application = db.get(CollegeApplication, task_data.related_application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Related application not found")
        if application.student_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this application")
    
    # Update fields
    update_data = task_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    # Update timestamps
    task.updated_at = datetime.utcnow()
    
    # Set completed_at if status is being set to completed
    if task_data.status == TaskStatus.COMPLETED and task.status != TaskStatus.COMPLETED:
        task.completed_at = datetime.utcnow()
    elif task_data.status != TaskStatus.COMPLETED and task.status == TaskStatus.COMPLETED:
        task.completed_at = None
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Add application name to response
    task_dict = task.dict()
    if task.related_application_id:
        application = db.get(CollegeApplication, task.related_application_id)
        task_dict["application_name"] = application.college_name if application else None
    else:
        task_dict["application_name"] = None
    
    return TaskResponse(**task_dict)

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Delete a specific task"""
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}

@router.post("/{task_id}/complete")
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    """Mark a task as completed"""
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    
    task.status = TaskStatus.COMPLETED
    task.completed_at = datetime.utcnow()
    task.updated_at = datetime.utcnow()
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return {"message": "Task marked as completed", "task_id": task_id} 