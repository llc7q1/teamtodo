# backend/routers/tasks.py
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Task, User
from schemas import TaskCreate, TaskUpdate, TaskOut
from routers.users import get_current_user

router = APIRouter(prefix="/api", tags=["tasks"])


def _task_to_out(task: Task) -> dict:
    """Convert Task ORM to dict with assignee_name."""
    data = {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "assignee_id": task.assignee_id,
        "assignee_name": task.assignee.display_name if task.assignee else None,
        "due_date": task.due_date,
        "created_by": task.created_by,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
    }
    return data


@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks = db.query(Task).all()
    return [_task_to_out(t) for t in tasks]


@router.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority,
        assignee_id=data.assignee_id,
        due_date=data.due_date,
        created_by=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return _task_to_out(task)


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return _task_to_out(task)


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    db.delete(task)
    db.commit()
    return {"message": "任务已删除"}
