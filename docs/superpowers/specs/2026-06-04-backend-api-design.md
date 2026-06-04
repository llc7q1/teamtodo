# TeamTodo 后端 API 设计文档

## 概述

为 TeamTodo 待办事项看板应用添加后端 API，实现多人数据共享。采用 FastAPI + SQLite + JWT 方案，先在本地跑通。

## 技术选型

| 组件 | 选择 | 理由 |
|------|------|------|
| 后端框架 | FastAPI | 现代 Python 框架，自动 API 文档，性能好 |
| 数据库 | SQLite | 零安装，Python 自带，小团队够用 |
| ORM | SQLAlchemy | Python 最主流的数据库工具 |
| 密码加密 | bcrypt (passlib) | 行业标准，不可逆加密 |
| 登录验证 | JWT (python-jose) | 无状态令牌，前后端分离标配 |
| HTTP 服务器 | Uvicorn | FastAPI 标配的 ASGI 服务器 |

## 整体架构

```
React 前端 (localhost:5173) ←→ FastAPI 后端 (localhost:8000) ←→ SQLite 数据库文件
```

- 前后端分离，通过 HTTP JSON 通信
- 需要同时启动两个服务
- Vite 开发服务器通过代理转发 API 请求到 FastAPI，避免跨域问题

## 数据库设计

### users 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | 主键, 自增 | 用户 ID |
| username | TEXT | 唯一, 非空 | 登录用户名 |
| password_hash | TEXT | 非空 | bcrypt 加密后的密码 |
| display_name | TEXT | 非空 | 显示名称 |
| created_at | DATETIME | 默认当前时间 | 注册时间 |

### tasks 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | 主键, 自增 | 任务 ID |
| title | TEXT | 非空 | 任务标题 |
| description | TEXT | 默认空字符串 | 任务描述 |
| status | TEXT | 非空, 默认 'todo' | todo / in_progress / done |
| priority | TEXT | 非空, 默认 'medium' | high / medium / low |
| assignee_id | INTEGER | 外键 users.id, 可空 | 指派人 |
| due_date | DATE | 可空 | 截止日期 |
| created_by | INTEGER | 外键 users.id, 非空 | 创建者 |
| created_at | DATETIME | 默认当前时间 | 创建时间 |
| updated_at | DATETIME | 默认当前时间 | 更新时间 |

## API 接口

### 用户接口

#### POST /api/register

注册新用户。

请求体：
```json
{
  "username": "xiaowang",
  "password": "123456",
  "display_name": "小王"
}
```

响应 201：
```json
{
  "id": 1,
  "username": "xiaowang",
  "display_name": "小王"
}
```

错误 400：用户名已存在。

#### POST /api/login

用户登录，返回 JWT Token。

请求体：
```json
{
  "username": "xiaowang",
  "password": "123456"
}
```

响应 200：
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer"
}
```

错误 401：用户名或密码错误。

#### GET /api/me

获取当前登录用户信息。需要 JWT Token。

响应 200：
```json
{
  "id": 1,
  "username": "xiaowang",
  "display_name": "小王"
}
```

#### GET /api/users

获取所有用户列表（用于任务指派下拉选择）。需要 JWT Token。

响应 200：
```json
[
  { "id": 1, "username": "xiaowang", "display_name": "小王" },
  { "id": 2, "username": "xiaoli", "display_name": "小李" }
]
```

### 任务接口

所有任务接口都需要 JWT Token。

#### GET /api/tasks

获取所有任务。

响应 200：
```json
[
  {
    "id": 1,
    "title": "完成首页设计稿",
    "description": "根据需求文档完成首页的 UI 设计",
    "status": "todo",
    "priority": "high",
    "assignee_id": 1,
    "assignee_name": "小王",
    "due_date": "2026-06-10",
    "created_by": 2,
    "created_at": "2026-06-04T10:00:00",
    "updated_at": "2026-06-04T10:00:00"
  }
]
```

#### POST /api/tasks

创建新任务。created_by 自动设为当前登录用户。

请求体：
```json
{
  "title": "新任务",
  "status": "todo"
}
```

响应 201：返回创建的完整任务对象。

#### PUT /api/tasks/{id}

更新任务。支持部分更新（只传需要修改的字段）。

请求体：
```json
{
  "status": "in_progress",
  "assignee_id": 2
}
```

响应 200：返回更新后的完整任务对象。
错误 404：任务不存在。

#### DELETE /api/tasks/{id}

删除任务。

响应 200：
```json
{ "message": "任务已删除" }
```

错误 404：任务不存在。

## JWT 认证流程

1. 用户登录 → 后端验证密码 → 生成 JWT Token（有效期 24 小时）
2. Token 包含用户 ID，用 SECRET_KEY 签名
3. 前端将 Token 存在 localStorage
4. 每次 API 请求在 Header 中携带：`Authorization: Bearer <token>`
5. 后端验证 Token 有效性和过期时间
6. Token 过期 → 返回 401 → 前端跳转到登录页

SECRET_KEY 在后端配置文件中定义，本地开发用固定值即可。

## 前端改造

### 新增文件

| 文件 | 职责 |
|------|------|
| `src/utils/api.js` | HTTP 请求封装，自动附带 JWT Token |
| `src/components/Auth/Login.jsx` | 登录页面 |
| `src/components/Auth/Login.module.css` | 登录页样式 |
| `src/components/Auth/Register.jsx` | 注册页面 |
| `src/components/Auth/Register.module.css` | 注册页样式 |
| `src/context/AuthContext.jsx` | 登录状态管理（Token 存储、登录/登出） |

### 改造文件

| 文件 | 改动 |
|------|------|
| `src/context/TaskContext.jsx` | 所有数据操作从 localStorage 改为调用 API |
| `src/utils/storage.js` | 改为存储 JWT Token 而非任务数据 |
| `src/App.jsx` | 添加 AuthContext，未登录显示登录页 |
| `src/components/Navbar/Navbar.jsx` | 显示当前用户名，添加登出按钮 |
| `src/components/TaskDetailPanel/TaskDetailPanel.jsx` | 指派人下拉从 API 获取用户列表 |
| `vite.config.js` | 添加 API 代理配置，将 /api 请求转发到 FastAPI |

### 不变的文件

- Board、Column、TaskCard、AddTaskForm 的 JSX 和 CSS — 不需要改动
- 所有样式文件 — 保持 Cosmic 风格不变
- `src/data/constants.js` — 状态和优先级常量保持不变

### 登录/注册页面设计

- 居中卡片式布局，延续深色 Cosmic 风格
- 登录表单：用户名输入框、密码输入框、登录按钮
- 底部"没有账号？去注册"链接切换到注册页
- 注册表单：用户名、密码、显示名称、注册按钮
- 注册成功后自动跳转到登录页

## 后端文件结构

```
D:\Desktop\待办事项\
├── backend/
│   ├── main.py              # FastAPI 入口，挂载路由
│   ├── database.py          # SQLAlchemy 引擎和会话配置
│   ├── models.py            # 数据库模型（User, Task）
│   ├── schemas.py           # Pydantic 请求/响应模型
│   ├── auth.py              # JWT 生成/验证、密码加密
│   ├── routers/
│   │   ├── users.py         # 用户相关路由（注册/登录/列表）
│   │   └── tasks.py         # 任务相关路由（CRUD）
│   ├── requirements.txt     # Python 依赖
│   └── todo.db              # SQLite 数据库文件（自动生成）
```

## 启动方式

```bash
# 终端 1：启动后端
cd D:\Desktop\待办事项\backend
pip install -r requirements.txt
python -m uvicorn main:app --reload

# 终端 2：启动前端
cd D:\Desktop\待办事项
npm run dev
```

后端启动后访问 http://localhost:8000/docs 可以看到自动生成的 API 文档页面。

## Vite 代理配置

在 vite.config.js 中添加代理，让前端的 /api 请求自动转发到后端：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

这样前端代码中直接写 `fetch('/api/tasks')` 即可，不需要写完整的后端地址。
