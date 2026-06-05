# TeamTodo 后端 API 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 TeamTodo 添加 FastAPI 后端 + JWT 用户认证 + SQLite 数据库，实现多人共享任务数据，并将前端从 localStorage 改为调用 API。

**Architecture:** FastAPI 后端运行在 localhost:8000，提供 RESTful API。SQLAlchemy 操作 SQLite 数据库。JWT Token 实现无状态认证。Vite 开发服务器通过代理转发 /api 请求到后端。前端 TaskContext 从 localStorage 改为 fetch API 调用。

**Tech Stack:** FastAPI, SQLAlchemy, SQLite, passlib[bcrypt], python-jose[cryptography], uvicorn, pytest, httpx (测试)

---

## 文件结构

### 后端新建文件

```
backend/
├── main.py              # FastAPI 入口，CORS，挂载路由
├── database.py          # SQLAlchemy 引擎、会话、Base
├── models.py            # ORM 模型（User, Task）
├── schemas.py           # Pydantic 请求/响应模型
├── auth.py              # 密码哈希 + JWT 生成/验证
├── routers/
│   ├── users.py         # POST /register, /login, GET /me, /users
│   └── tasks.py         # GET/POST/PUT/DELETE /tasks
├── requirements.txt     # Python 依赖
└── tests/
    ├── conftest.py      # pytest fixtures（测试客户端、测试数据库）
    ├── test_auth.py     # auth 模块单元测试
    ├── test_users.py    # 用户接口测试
    └── test_tasks.py    # 任务接口测试
```

### 前端修改/新建文件

```
src/
├── utils/
│   ├── api.js           # 新建：HTTP 请求封装，自动带 Token
│   └── storage.js       # 改造：存 JWT Token 而非任务数据
├── context/
│   ├── AuthContext.jsx   # 新建：登录状态管理
│   └── TaskContext.jsx   # 改造：localStorage → API 调用
├── components/
│   ├── Auth/             # 已存在：Login.jsx, Register.jsx, Auth.module.css
│   └── Navbar/
│       └── Navbar.jsx    # 改造：显示用户名 + 登出按钮
├── App.jsx               # 改造：集成 AuthContext，登录路由
vite.config.js            # 改造：添加 /api 代理
```

---

## Task 1: 后端项目初始化

**Files:**
- Create: `backend/requirements.txt`

- [ ] **Step 1: 创建 backend 目录和依赖文件**

```txt
# backend/requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
python-multipart==0.0.9
pytest==8.3.0
httpx==0.27.0
```

- [ ] **Step 2: 安装依赖**

```bash
cd "D:/Desktop/待办事项/backend"
pip install -r requirements.txt
```

Expected: 所有包安装成功，无报错。

- [ ] **Step 3: 创建测试目录**

```bash
cd "D:/Desktop/待办事项/backend"
mkdir -p tests routers
```

- [ ] **Step 4: 提交**

```bash
cd "D:/Desktop/待办事项"
git add backend/requirements.txt
git commit -m "feat(backend): 初始化后端项目，添加 Python 依赖"
```

---

## Task 2: 数据库配置

**Files:**
- Create: `backend/database.py`

- [ ] **Step 1: 创建数据库配置**

```python
# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./todo.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 2: 提交**

```bash
cd "D:/Desktop/待办事项"
git add backend/database.py
git commit -m "feat(backend): 添加 SQLAlchemy 数据库配置"
```

---

## Task 3: 数据库模型

**Files:**
- Create: `backend/models.py`

- [ ] **Step 1: 创建 ORM 模型**

```python
# backend/models.py
from datetime import datetime, date
from sqlalchemy import Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    created_tasks: Mapped[list["Task"]] = relationship(
        back_populates="creator", foreign_keys="Task.created_by"
    )
    assigned_tasks: Mapped[list["Task"]] = relationship(
        back_populates="assignee", foreign_keys="Task.assignee_id"
    )


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="todo")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    assignee_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    creator: Mapped["User"] = relationship(
        back_populates="created_tasks", foreign_keys=[created_by]
    )
    assignee: Mapped["User | None"] = relationship(
        back_populates="assigned_tasks", foreign_keys=[assignee_id]
    )
```

- [ ] **Step 2: 提交**

```bash
cd "D:/Desktop/待办事项"
git add backend/models.py
git commit -m "feat(backend): 添加 User 和 Task 数据库模型"
```

---

## Task 4: Pydantic 请求/响应模型

**Files:**
- Create: `backend/schemas.py`

- [ ] **Step 1: 创建 schemas**

```python
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
```

- [ ] **Step 2: 提交**

```bash
cd "D:/Desktop/待办事项"
git add backend/schemas.py
git commit -m "feat(backend): 添加 Pydantic 请求/响应模型"
```

---

## Task 5: 认证模块 (TDD)

**Files:**
- Create: `backend/auth.py`, `backend/tests/conftest.py`, `backend/tests/test_auth.py`

- [ ] **Step 1: 创建 pytest 配置和 fixtures**

```python
# backend/tests/conftest.py
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app

TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test.db"):
        os.remove("./test.db")


@pytest.fixture
def db():
    session = TestSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client):
    """Register a user and return the response data."""
    resp = client.post("/api/register", json={
        "username": "testuser",
        "password": "testpass123",
        "display_name": "测试用户",
    })
    return resp.json()


@pytest.fixture
def auth_header(client, registered_user):
    """Login and return Authorization header dict."""
    resp = client.post("/api/login", json={
        "username": "testuser",
        "password": "testpass123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

- [ ] **Step 2: 写认证模块的失败测试**

```python
# backend/tests/test_auth.py
from auth import hash_password, verify_password, create_access_token, decode_access_token


def test_hash_password_returns_different_from_plain():
    hashed = hash_password("mysecret")
    assert hashed != "mysecret"
    assert len(hashed) > 20


def test_verify_password_correct():
    hashed = hash_password("mysecret")
    assert verify_password("mysecret", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("mysecret")
    assert verify_password("wrongpass", hashed) is False


def test_create_and_decode_token():
    token = create_access_token(user_id=42)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "42"


def test_decode_invalid_token():
    payload = decode_access_token("invalid.token.here")
    assert payload is None
```

- [ ] **Step 3: 运行测试验证失败**

```bash
cd "D:/Desktop/待办事项/backend"
python -m pytest tests/test_auth.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'auth'`（因为 auth.py 还不存在）

- [ ] **Step 4: 实现 auth 模块**

```python
# backend/auth.py
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError

SECRET_KEY = "teamtodo-dev-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

- [ ] **Step 5: 还需要一个空壳 main.py 让 conftest 能导入**

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TeamTodo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "TeamTodo API is running"}
```

- [ ] **Step 6: 运行测试验证通过**

```bash
cd "D:/Desktop/待办事项/backend"
python -m pytest tests/test_auth.py -v
```

Expected: 5 tests PASSED

- [ ] **Step 7: 提交**

```bash
cd "D:/Desktop/待办事项"
git add backend/auth.py backend/main.py backend/tests/
git commit -m "feat(backend): 添加认证模块 — 密码哈希 + JWT，含测试"
```

---

## Task 6: 用户路由 (TDD)

**Files:**
- Create: `backend/routers/users.py`, `backend/tests/test_users.py`

- [ ] **Step 1: 写用户接口的失败测试**

```python
# backend/tests/test_users.py


def test_register_success(client):
    resp = client.post("/api/register", json={
        "username": "newuser",
        "password": "pass123",
        "display_name": "新用户",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "newuser"
    assert data["display_name"] == "新用户"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_username(client, registered_user):
    resp = client.post("/api/register", json={
        "username": "testuser",
        "password": "other123",
        "display_name": "另一个",
    })
    assert resp.status_code == 400
    assert "已存在" in resp.json()["detail"]


def test_login_success(client, registered_user):
    resp = client.post("/api/login", json={
        "username": "testuser",
        "password": "testpass123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, registered_user):
    resp = client.post("/api/login", json={
        "username": "testuser",
        "password": "wrongpass",
    })
    assert resp.status_code == 401


def test_login_nonexistent_user(client):
    resp = client.post("/api/login", json={
        "username": "nobody",
        "password": "pass123",
    })
    assert resp.status_code == 401


def test_get_me(client, auth_header):
    resp = client.get("/api/me", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "testuser"
    assert data["display_name"] == "测试用户"


def test_get_me_no_token(client):
    resp = client.get("/api/me")
    assert resp.status_code == 401


def test_get_users(client, auth_header, registered_user):
    resp = client.get("/api/users", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["display_name"] == "测试用户"
```

- [ ] **Step 2: 运行测试验证失败**

```bash
cd "D:/Desktop/待办事项/backend"
python -m pytest tests/test_users.py -v
```

Expected: FAIL — 404 (路由未注册)

- [ ] **Step 3: 实现用户路由**

```python
# backend/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserRegister, UserLogin, UserOut, TokenOut
from auth import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api", tags=["users"])


def get_current_user(
    db: Session = Depends(get_db),
    authorization: str | None = None,
) -> User:
    """Extract and validate JWT from Authorization header."""
    from fastapi import Request

    raise HTTPException(status_code=401, detail="未登录")


# Dependency: extract token from header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="未登录")

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token 无效或已过期")

    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user


@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="用户名已存在")

    user = User(
        username=data.username,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = create_access_token(user_id=user.id)
    return TokenOut(access_token=token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(User).all()
```

- [ ] **Step 4: 在 main.py 中注册路由**

更新 `backend/main.py`，在 `@app.get("/")` 之前添加：

```python
from routers import users

app.include_router(users.router)
```

完整 main.py：

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TeamTodo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "TeamTodo API is running"}
```

- [ ] **Step 5: 创建 routers/__init__.py**

```python
# backend/routers/__init__.py
```

空文件，让 Python 把 routers 当作包。

- [ ] **Step 6: 运行测试验证通过**

```bash
cd "D:/Desktop/待办事项/backend"
python -m pytest tests/test_users.py -v
```

Expected: 8 tests PASSED

- [ ] **Step 7: 提交**

```bash
cd "D:/Desktop/待办事项"
git add backend/routers/ backend/main.py backend/tests/test_users.py
git commit -m "feat(backend): 添加用户路由 — 注册/登录/获取用户，含测试"
```

---

## Task 7: 任务路由 (TDD)

**Files:**
- Create: `backend/routers/tasks.py`, `backend/tests/test_tasks.py`

- [ ] **Step 1: 写任务接口的失败测试**

```python
# backend/tests/test_tasks.py
import pytest


@pytest.fixture
def sample_task(client, auth_header):
    """Create a task and return it."""
    resp = client.post("/api/tasks", json={
        "title": "测试任务",
        "status": "todo",
        "priority": "high",
    }, headers=auth_header)
    return resp.json()


def test_create_task(client, auth_header):
    resp = client.post("/api/tasks", json={
        "title": "新任务",
        "status": "todo",
    }, headers=auth_header)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "新任务"
    assert data["status"] == "todo"
    assert data["priority"] == "medium"
    assert data["created_by"] is not None


def test_create_task_no_auth(client):
    resp = client.post("/api/tasks", json={"title": "新任务"})
    assert resp.status_code == 401


def test_get_tasks(client, auth_header, sample_task):
    resp = client.get("/api/tasks", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["title"] == "测试任务"


def test_get_tasks_no_auth(client):
    resp = client.get("/api/tasks")
    assert resp.status_code == 401


def test_update_task(client, auth_header, sample_task):
    task_id = sample_task["id"]
    resp = client.put(f"/api/tasks/{task_id}", json={
        "status": "in_progress",
        "priority": "low",
    }, headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "in_progress"
    assert data["priority"] == "low"
    assert data["title"] == "测试任务"


def test_update_task_not_found(client, auth_header):
    resp = client.put("/api/tasks/9999", json={
        "title": "不存在",
    }, headers=auth_header)
    assert resp.status_code == 404


def test_delete_task(client, auth_header, sample_task):
    task_id = sample_task["id"]
    resp = client.delete(f"/api/tasks/{task_id}", headers=auth_header)
    assert resp.status_code == 200

    # Verify deleted
    resp2 = client.get("/api/tasks", headers=auth_header)
    tasks = resp2.json()
    assert all(t["id"] != task_id for t in tasks)


def test_delete_task_not_found(client, auth_header):
    resp = client.delete("/api/tasks/9999", headers=auth_header)
    assert resp.status_code == 404


def test_task_with_assignee(client, auth_header, registered_user, sample_task):
    task_id = sample_task["id"]
    user_id = registered_user["id"]
    resp = client.put(f"/api/tasks/{task_id}", json={
        "assignee_id": user_id,
    }, headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert data["assignee_id"] == user_id
    assert data["assignee_name"] == "测试用户"
```

- [ ] **Step 2: 运行测试验证失败**

```bash
cd "D:/Desktop/待办事项/backend"
python -m pytest tests/test_tasks.py -v
```

Expected: FAIL — 404 (路由未注册)

- [ ] **Step 3: 实现任务路由**

```python
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
```

- [ ] **Step 4: 在 main.py 中注册任务路由**

更新 `backend/main.py`：

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import users, tasks

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TeamTodo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(tasks.router)


@app.get("/")
def root():
    return {"message": "TeamTodo API is running"}
```

- [ ] **Step 5: 运行全部后端测试**

```bash
cd "D:/Desktop/待办事项/backend"
python -m pytest tests/ -v
```

Expected: 全部 PASSED（auth 5 + users 8 + tasks 9 = 22 tests）

- [ ] **Step 6: 启动验证 API 文档**

```bash
cd "D:/Desktop/待办事项/backend"
python -m uvicorn main:app --reload
```

Expected: 访问 http://localhost:8000/docs 能看到所有接口的交互式文档。验证后 Ctrl+C 停止。

- [ ] **Step 7: 提交**

```bash
cd "D:/Desktop/待办事项"
git add backend/routers/tasks.py backend/main.py backend/tests/test_tasks.py
git commit -m "feat(backend): 添加任务 CRUD 路由，含测试"
```

---

## Task 8: 前端 API 工具和 Token 存储

**Files:**
- Create: `src/utils/api.js`
- Modify: `src/utils/storage.js`

- [ ] **Step 1: 创建 API 请求封装**

```js
// src/utils/api.js
import { getToken, removeToken } from './storage';

const BASE_URL = '/api';

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    window.location.reload();
    return;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `请求失败 (${response.status})`);
  }

  return response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
```

- [ ] **Step 2: 改造 storage.js 为 Token 存储**

覆盖 `src/utils/storage.js`：

```js
// src/utils/storage.js
const TOKEN_KEY = 'teamtodo-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
```

- [ ] **Step 3: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/utils/
git commit -m "feat(frontend): 添加 API 请求封装，改造 Token 存储"
```

---

## Task 9: AuthContext 和 App 集成

**Files:**
- Create: `src/context/AuthContext.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: 创建 AuthContext**

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../utils/api';
import { getToken, saveToken, removeToken } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const isLoggedIn = !!token;

  const fetchUser = useCallback(async () => {
    try {
      const userData = await api.get('/me');
      setUser(userData);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user on mount if token exists
  useState(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  });

  const login = useCallback(async (username, password) => {
    const data = await api.post('/login', { username, password });
    saveToken(data.access_token);
    setToken(data.access_token);
    const userData = await api.get('/me');
    setUser(userData);
  }, []);

  const register = useCallback(async (username, password, displayName) => {
    await api.post('/register', {
      username,
      password,
      display_name: displayName,
    });
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: 改造 App.jsx**

覆盖 `src/App.jsx`：

```jsx
// src/App.jsx
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import Board from './components/Board/Board';
import TaskDetailPanel from './components/TaskDetailPanel/TaskDetailPanel';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function AppContent() {
  const { isLoggedIn, loading, login, register, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '1.125rem',
      }}>
        加载中...
      </div>
    );
  }

  if (!isLoggedIn) {
    if (authMode === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthMode('login')}
          onRegister={async (username, password, displayName) => {
            await register(username, password, displayName);
            setAuthMode('login');
          }}
        />
      );
    }
    return (
      <Login
        onSwitchToRegister={() => setAuthMode('register')}
        onLogin={login}
      />
    );
  }

  return (
    <TaskProvider>
      <Navbar />
      <Board />
      <TaskDetailPanel />
    </TaskProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 3: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/context/AuthContext.jsx src/App.jsx
git commit -m "feat(frontend): 添加 AuthContext，集成登录/注册流程"
```

---

## Task 10: 改造 TaskContext — localStorage 改 API

**Files:**
- Modify: `src/context/TaskContext.jsx`

- [ ] **Step 1: 重写 TaskContext**

覆盖 `src/context/TaskContext.jsx`：

```jsx
// src/context/TaskContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch tasks and users on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksData, usersData] = await Promise.all([
          api.get('/tasks'),
          api.get('/users'),
        ]);
        setTasks(tasksData);
        setUsers(usersData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const addTask = useCallback(async (title, status) => {
    const newTask = await api.post('/tasks', { title, status });
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    const updated = await api.put(`/tasks/${id}`, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTaskId(null);
  }, []);

  const moveTask = useCallback(async (taskId, newStatus) => {
    const updated = await api.put(`/tasks/${taskId}`, { status: newStatus });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  }, []);

  const getTasksByStatus = useCallback(
    (status) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontFamily: 'Outfit, sans-serif',
      }}>
        加载任务中...
      </div>
    );
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        users,
        selectedTask,
        setSelectedTaskId,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        getTasksByStatus,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
}
```

- [ ] **Step 2: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/context/TaskContext.jsx
git commit -m "feat(frontend): TaskContext 从 localStorage 改为 API 调用"
```

---

## Task 11: 改造 Navbar — 显示用户名 + 登出

**Files:**
- Modify: `src/components/Navbar/Navbar.jsx`, `src/components/Navbar/Navbar.module.css`

- [ ] **Step 1: 更新 Navbar 组件**

覆盖 `src/components/Navbar/Navbar.jsx`：

```jsx
// src/components/Navbar/Navbar.jsx
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>T</span>
        TeamTodo
      </div>
      <div className={styles.actions}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>&#128269;</span>
          <input
            type="text"
            placeholder="搜索任务..."
            className={styles.searchInput}
          />
        </div>
        <button className={styles.iconButton} title="通知">
          &#128276;
        </button>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.display_name?.charAt(0) || '我'}
          </div>
          <span className={styles.userName}>{user?.display_name || ''}</span>
        </div>
        <button className={styles.logoutButton} onClick={logout} title="登出">
          &#10151;
        </button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 添加 Navbar 新样式**

在 `src/components/Navbar/Navbar.module.css` 末尾追加：

```css
.userInfo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.userName {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.logoutButton {
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 1rem;
  padding: 0.5rem;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}

.logoutButton:hover {
  color: var(--priority-high);
  border-color: rgba(255, 76, 106, 0.3);
  background: var(--priority-high-glow);
}
```

- [ ] **Step 3: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/components/Navbar/
git commit -m "feat(frontend): Navbar 显示当前用户名和登出按钮"
```

---

## Task 12: 改造 TaskDetailPanel — 指派人从 API 获取

**Files:**
- Modify: `src/components/TaskDetailPanel/TaskDetailPanel.jsx`

- [ ] **Step 1: 更新指派人字段映射**

TaskDetailPanel 目前使用 `assignee` (字符串 user ID)。后端 API 使用 `assignee_id` (数字)。需要更新字段名。

覆盖 `src/components/TaskDetailPanel/TaskDetailPanel.jsx`：

```jsx
// src/components/TaskDetailPanel/TaskDetailPanel.jsx
import { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { STATUS_LABELS, PRIORITY_LABELS, STATUSES, PRIORITIES } from '../../data/constants';
import styles from './TaskDetailPanel.module.css';

export default function TaskDetailPanel() {
  const { selectedTask, setSelectedTaskId, updateTask, deleteTask, users } = useTaskContext();

  const [form, setForm] = useState({
    title: '',
    status: STATUSES.TODO,
    assignee_id: null,
    priority: PRIORITIES.MEDIUM,
    due_date: '',
    description: '',
  });

  useEffect(() => {
    if (selectedTask) {
      setForm({
        title: selectedTask.title,
        status: selectedTask.status,
        assignee_id: selectedTask.assignee_id,
        priority: selectedTask.priority,
        due_date: selectedTask.due_date || '',
        description: selectedTask.description,
      });
    }
  }, [selectedTask]);

  if (!selectedTask) return null;

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'assignee_id') {
      value = value === '' ? null : Number(value);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await updateTask(selectedTask.id, form);
    setSelectedTaskId(null);
  };

  const handleDelete = async () => {
    if (window.confirm('确定要删除这个任务吗？')) {
      await deleteTask(selectedTask.id);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={() => setSelectedTaskId(null)} />
      <div className={styles.panel}>
        <button className={styles.closeButton} onClick={() => setSelectedTaskId(null)}>
          ✕
        </button>

        <input
          className={styles.titleInput}
          value={form.title}
          onChange={handleChange('title')}
          placeholder="任务标题"
        />

        <div className={styles.fieldGroup}>
          <label className={styles.label}>状态</label>
          <select className={styles.select} value={form.status} onChange={handleChange('status')}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>指派人</label>
          <select
            className={styles.select}
            value={form.assignee_id ?? ''}
            onChange={handleChange('assignee_id')}
          >
            <option value="">未指派</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.display_name}</option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>优先级</label>
          <select className={styles.select} value={form.priority} onChange={handleChange('priority')}>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>截止日期</label>
          <input
            type="date"
            className={styles.dateInput}
            value={form.due_date}
            onChange={handleChange('due_date')}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>描述</label>
          <textarea
            className={styles.textarea}
            value={form.description}
            onChange={handleChange('description')}
            placeholder="添加任务描述..."
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.deleteButton} onClick={handleDelete}>
            删除任务
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/components/TaskDetailPanel/TaskDetailPanel.jsx
git commit -m "feat(frontend): TaskDetailPanel 适配后端 API 字段名"
```

---

## Task 13: 改造 TaskCard — 适配 API 字段

**Files:**
- Modify: `src/components/TaskCard/TaskCard.jsx`

- [ ] **Step 1: 更新 TaskCard 使用 assignee_name 和 due_date**

覆盖 `src/components/TaskCard/TaskCard.jsx`：

```jsx
// src/components/TaskCard/TaskCard.jsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../../data/constants';
import { useTaskContext } from '../../context/TaskContext';
import styles from './TaskCard.module.css';

export default function TaskCard({ task }) {
  const { setSelectedTaskId } = useTaskContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      onClick={() => setSelectedTaskId(task.id)}
    >
      <div className={styles.header}>
        <span
          className={styles.priorityBadge}
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
        />
        <span className={styles.priorityLabel}>
          {PRIORITY_LABELS[task.priority]}优先级
        </span>
      </div>

      <div className={styles.title}>{task.title}</div>

      <div className={styles.footer}>
        <div className={styles.assignee}>
          {task.assignee_name && (
            <>
              <span className={styles.assigneeAvatar}>
                {task.assignee_name.charAt(0)}
              </span>
              {task.assignee_name}
            </>
          )}
        </div>
        {task.due_date && (
          <span className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
            📅 {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/components/TaskCard/TaskCard.jsx
git commit -m "feat(frontend): TaskCard 适配后端 API 字段（assignee_name, due_date）"
```

---

## Task 14: Vite 代理配置 + 最终验收

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: 添加 API 代理**

覆盖 `vite.config.js`：

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 2: 添加 .gitignore 条目**

在项目根目录 `.gitignore` 末尾追加：

```
# Backend
backend/todo.db
backend/test.db
backend/__pycache__/
backend/tests/__pycache__/
backend/routers/__pycache__/
```

- [ ] **Step 3: 构建前端检查**

```bash
cd "D:/Desktop/待办事项"
npm run build
```

Expected: 构建成功，无错误。

- [ ] **Step 4: 运行后端测试**

```bash
cd "D:/Desktop/待办事项/backend"
python -m pytest tests/ -v
```

Expected: 全部 PASSED

- [ ] **Step 5: 全功能验收**

终端 1：
```bash
cd "D:/Desktop/待办事项/backend"
python -m uvicorn main:app --reload
```

终端 2：
```bash
cd "D:/Desktop/待办事项"
npm run dev
```

验收清单：
1. ✅ 打开 http://localhost:5173 看到登录页面
2. ✅ 点"去注册"切换到注册页
3. ✅ 注册新用户（用户名 + 密码 + 显示名称）
4. ✅ 注册后自动回到登录页
5. ✅ 用刚注册的账号登录
6. ✅ 登录后看到看板（空的，需要添加任务）
7. ✅ 导航栏显示当前用户名
8. ✅ 添加新任务正常
9. ✅ 拖拽任务正常
10. ✅ 点击卡片打开详情面板，编辑保存正常
11. ✅ 删除任务正常
12. ✅ 刷新页面数据不丢失
13. ✅ 点登出按钮回到登录页
14. ✅ 另一个浏览器/无痕窗口注册第二个用户，能看到相同任务

- [ ] **Step 6: 最终提交**

```bash
cd "D:/Desktop/待办事项"
git add -A
git commit -m "feat: 完成后端 API 集成 — Vite 代理 + .gitignore 更新"
```
