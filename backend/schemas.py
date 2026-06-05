# backend/schemas.py
from datetime import date, datetime
from pydantic import BaseModel


# ---- User ----
class UserRegister(BaseModel):
    username: str
    password: str
    display_name: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    display_name: str

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---- Task ----
class TaskCreate(BaseModel):
    title: str
    status: str = "todo"
    priority: str = "medium"
    description: str = ""
    assignee_id: int | None = None
    due_date: date | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    status: str | None = None
    priority: str | None = None
    description: str | None = None
    assignee_id: int | None = None
    due_date: date | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: str
    assignee_id: int | None
    assignee_name: str | None = None
    due_date: date | None
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
