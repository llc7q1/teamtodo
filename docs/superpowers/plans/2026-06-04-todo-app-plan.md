# 待办事项 App 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个深色主题的看板式待办事项 App，支持任务拖拽、指派、优先级和截止日期，面向 2-5 人小团队。

**Architecture:** React 单页应用，使用 @dnd-kit 实现拖拽，React Context 管理全局状态，localStorage 持久化数据。组件按职责拆分：Navbar、Board、Column、TaskCard、TaskDetailPanel。

**Tech Stack:** React 18, @dnd-kit/core + @dnd-kit/sortable, CSS Modules, Vite (构建工具), localStorage (数据持久化)

---

## 文件结构

```
D:\Desktop\待办事项\
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                    # 入口文件
│   ├── App.jsx                     # 根组件，组合 Navbar + Board + DetailPanel
│   ├── App.module.css              # App 布局样式
│   ├── index.css                   # 全局样式、CSS 变量（主题色）
│   ├── data/
│   │   ├── initialData.js          # 初始示例数据（任务+用户）
│   │   └── constants.js            # 状态/优先级枚举常量
│   ├── context/
│   │   └── TaskContext.jsx         # 全局状态管理（任务CRUD、拖拽更新）
│   ├── components/
│   │   ├── Navbar/
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.module.css
│   │   ├── Board/
│   │   │   ├── Board.jsx
│   │   │   └── Board.module.css
│   │   ├── Column/
│   │   │   ├── Column.jsx
│   │   │   └── Column.module.css
│   │   ├── TaskCard/
│   │   │   ├── TaskCard.jsx
│   │   │   └── TaskCard.module.css
│   │   ├── TaskDetailPanel/
│   │   │   ├── TaskDetailPanel.jsx
│   │   │   └── TaskDetailPanel.module.css
│   │   └── AddTaskForm/
│   │       ├── AddTaskForm.jsx
│   │       └── AddTaskForm.module.css
│   └── utils/
│       └── storage.js              # localStorage 读写封装
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/index.css`

- [ ] **Step 1: 初始化 React 项目**

```bash
cd "D:/Desktop/待办事项"
npm create vite@latest . -- --template react
```

选择当前目录，React 模板。如果提示目录非空，选择继续。

- [ ] **Step 2: 安装依赖**

```bash
cd "D:/Desktop/待办事项"
npm install
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 3: 清理模板文件**

删除 Vite 默认生成的示例文件：

```bash
cd "D:/Desktop/待办事项"
rm -f src/App.css src/assets/react.svg public/vite.svg
```

- [ ] **Step 4: 写入全局样式 (index.css)**

覆盖 `src/index.css`，定义 CSS 变量和全局重置：

```css
:root {
  --bg-main: #1a1a2e;
  --bg-card: #16213e;
  --bg-navbar: #0f3460;
  --accent: #533483;
  --text-primary: #e0e0e0;
  --text-secondary: #8892a0;
  --priority-high: #e74c3c;
  --priority-medium: #f39c12;
  --priority-low: #2ecc71;
  --border-radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-main);
  color: var(--text-primary);
  min-height: 100vh;
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
}
```

- [ ] **Step 5: 写入入口文件 (main.jsx)**

覆盖 `src/main.jsx`：

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 6: 写入空壳 App.jsx**

覆盖 `src/App.jsx`：

```jsx
function App() {
  return (
    <div>
      <h1 style={{ padding: '2rem', color: 'var(--text-primary)' }}>
        待办事项 App - 项目已初始化
      </h1>
    </div>
  );
}

export default App;
```

- [ ] **Step 7: 启动验证**

```bash
cd "D:/Desktop/待办事项"
npm run dev
```

Expected: 浏览器打开后看到深蓝黑背景 + "待办事项 App - 项目已初始化" 文字。

- [ ] **Step 8: 初始化 Git 并提交**

```bash
cd "D:/Desktop/待办事项"
git init
git add -A
git commit -m "feat: 初始化 React + Vite 项目，配置深色主题"
```

---

## Task 2: 数据层 — 常量、初始数据、存储工具

**Files:**
- Create: `src/data/constants.js`, `src/data/initialData.js`, `src/utils/storage.js`

- [ ] **Step 1: 创建常量文件 (constants.js)**

```js
// src/data/constants.js
export const STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

export const STATUS_LABELS = {
  [STATUSES.TODO]: '待办',
  [STATUSES.IN_PROGRESS]: '进行中',
  [STATUSES.DONE]: '已完成',
};

export const PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const PRIORITY_LABELS = {
  [PRIORITIES.HIGH]: '高',
  [PRIORITIES.MEDIUM]: '中',
  [PRIORITIES.LOW]: '低',
};

export const PRIORITY_COLORS = {
  [PRIORITIES.HIGH]: 'var(--priority-high)',
  [PRIORITIES.MEDIUM]: 'var(--priority-medium)',
  [PRIORITIES.LOW]: 'var(--priority-low)',
};

export const COLUMNS = [STATUSES.TODO, STATUSES.IN_PROGRESS, STATUSES.DONE];
```

- [ ] **Step 2: 创建初始数据 (initialData.js)**

```js
// src/data/initialData.js
import { STATUSES, PRIORITIES } from './constants';

export const INITIAL_USERS = [
  { id: 'user-1', name: '小王', avatar: '' },
  { id: 'user-2', name: '小李', avatar: '' },
  { id: 'user-3', name: '小张', avatar: '' },
];

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: '完成首页设计稿',
    description: '根据需求文档完成首页的 UI 设计',
    status: STATUSES.TODO,
    priority: PRIORITIES.HIGH,
    assignee: 'user-1',
    dueDate: '2026-06-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: '搭建项目框架',
    description: '初始化前端项目，配置路由和状态管理',
    status: STATUSES.IN_PROGRESS,
    priority: PRIORITIES.MEDIUM,
    assignee: 'user-2',
    dueDate: '2026-06-08',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: '编写需求文档',
    description: '整理产品需求并编写文档',
    status: STATUSES.DONE,
    priority: PRIORITIES.LOW,
    assignee: 'user-3',
    dueDate: '2026-06-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
```

- [ ] **Step 3: 创建存储工具 (storage.js)**

```js
// src/utils/storage.js
const STORAGE_KEY = 'todo-app-tasks';

export function loadTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
```

- [ ] **Step 4: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/data/ src/utils/
git commit -m "feat: 添加常量定义、初始数据和 localStorage 存储工具"
```

---

## Task 3: 全局状态管理 — TaskContext

**Files:**
- Create: `src/context/TaskContext.jsx`

- [ ] **Step 1: 创建 TaskContext**

```jsx
// src/context/TaskContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_TASKS, INITIAL_USERS } from '../data/initialData';
import { loadTasks, saveTasks } from '../utils/storage';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => loadTasks() || INITIAL_TASKS);
  const [users] = useState(INITIAL_USERS);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const updateAndSave = useCallback((updater) => {
    setTasks((prev) => {
      const next = updater(prev);
      saveTasks(next);
      return next;
    });
  }, []);

  const addTask = useCallback((title, status) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description: '',
      status,
      priority: 'medium',
      assignee: '',
      dueDate: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateAndSave((prev) => [...prev, newTask]);
  }, [updateAndSave]);

  const updateTask = useCallback((id, updates) => {
    updateAndSave((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      )
    );
  }, [updateAndSave]);

  const deleteTask = useCallback((id) => {
    updateAndSave((prev) => prev.filter((t) => t.id !== id));
    setSelectedTaskId(null);
  }, [updateAndSave]);

  const moveTask = useCallback((taskId, newStatus) => {
    updateAndSave((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }, [updateAndSave]);

  const getTasksByStatus = useCallback(
    (status) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

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

- [ ] **Step 2: 在 App.jsx 中接入 TaskProvider**

覆盖 `src/App.jsx`：

```jsx
import { TaskProvider } from './context/TaskContext';

function App() {
  return (
    <TaskProvider>
      <div>
        <h1 style={{ padding: '2rem', color: 'var(--text-primary)' }}>
          待办事项 App - Context 已接入
        </h1>
      </div>
    </TaskProvider>
  );
}

export default App;
```

- [ ] **Step 3: 启动验证**

```bash
cd "D:/Desktop/待办事项"
npm run dev
```

Expected: 页面正常显示，控制台无报错。

- [ ] **Step 4: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/context/ src/App.jsx
git commit -m "feat: 添加 TaskContext 全局状态管理"
```

---

## Task 4: Navbar 组件

**Files:**
- Create: `src/components/Navbar/Navbar.jsx`, `src/components/Navbar/Navbar.module.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: 创建 Navbar 样式**

```css
/* src/components/Navbar/Navbar.module.css */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 56px;
  background-color: var(--bg-navbar);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.searchInput {
  padding: 0.4rem 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--text-secondary);
  background: var(--bg-main);
  color: var(--text-primary);
  font-size: 0.875rem;
  width: 200px;
  outline: none;
}

.searchInput::placeholder {
  color: var(--text-secondary);
}

.searchInput:focus {
  border-color: var(--accent);
}

.iconButton {
  background: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  padding: 0.25rem;
  border-radius: 50%;
  transition: color 0.2s;
}

.iconButton:hover {
  color: var(--text-primary);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}
```

- [ ] **Step 2: 创建 Navbar 组件**

```jsx
// src/components/Navbar/Navbar.jsx
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        📋 TeamTodo
      </div>
      <div className={styles.actions}>
        <input
          type="text"
          placeholder="搜索任务..."
          className={styles.searchInput}
        />
        <button className={styles.iconButton} title="通知">
          🔔
        </button>
        <div className={styles.avatar}>我</div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: 在 App.jsx 中引入 Navbar**

覆盖 `src/App.jsx`：

```jsx
import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <TaskProvider>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>看板区域即将到来...</p>
      </main>
    </TaskProvider>
  );
}

export default App;
```

- [ ] **Step 4: 启动验证**

```bash
cd "D:/Desktop/待办事项"
npm run dev
```

Expected: 顶部显示深蓝色导航栏，包含 logo、搜索框、通知图标、头像。

- [ ] **Step 5: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/components/Navbar/ src/App.jsx
git commit -m "feat: 添加顶部导航栏组件"
```

---

## Task 5: TaskCard 组件

**Files:**
- Create: `src/components/TaskCard/TaskCard.jsx`, `src/components/TaskCard/TaskCard.module.css`

- [ ] **Step 1: 创建 TaskCard 样式**

```css
/* src/components/TaskCard/TaskCard.module.css */
.card {
  background: var(--bg-card);
  border-radius: var(--border-radius);
  padding: 0.875rem;
  cursor: grab;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.priorityBadge {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 0.625rem;
}

.priorityLabel {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.assignee {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.assigneeAvatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
}

.dueDate {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.dueDate.overdue {
  color: var(--priority-high);
}

.dragging {
  opacity: 0.5;
  cursor: grabbing;
}
```

- [ ] **Step 2: 创建 TaskCard 组件**

```jsx
// src/components/TaskCard/TaskCard.jsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../../data/constants';
import { useTaskContext } from '../../context/TaskContext';
import styles from './TaskCard.module.css';

export default function TaskCard({ task }) {
  const { users, setSelectedTaskId } = useTaskContext();

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

  const assignee = users.find((u) => u.id === task.assignee);

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

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
          {assignee && (
            <>
              <span className={styles.assigneeAvatar}>
                {assignee.name.charAt(0)}
              </span>
              {assignee.name}
            </>
          )}
        </div>
        {task.dueDate && (
          <span className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
            📅 {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/components/TaskCard/
git commit -m "feat: 添加任务卡片组件，支持拖拽和优先级显示"
```

---

## Task 6: AddTaskForm 组件

**Files:**
- Create: `src/components/AddTaskForm/AddTaskForm.jsx`, `src/components/AddTaskForm/AddTaskForm.module.css`

- [ ] **Step 1: 创建 AddTaskForm 样式**

```css
/* src/components/AddTaskForm/AddTaskForm.module.css */
.addButton {
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px dashed var(--text-secondary);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: border-color 0.2s, color 0.2s;
}

.addButton:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.form {
  display: flex;
  gap: 0.5rem;
}

.input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--text-secondary);
  background: var(--bg-main);
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
}

.input:focus {
  border-color: var(--accent);
}

.submitButton {
  padding: 0.5rem 0.75rem;
  background: var(--accent);
  color: white;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

.submitButton:hover {
  opacity: 0.9;
}

.cancelButton {
  padding: 0.5rem 0.75rem;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

.cancelButton:hover {
  color: var(--text-primary);
}
```

- [ ] **Step 2: 创建 AddTaskForm 组件**

```jsx
// src/components/AddTaskForm/AddTaskForm.jsx
import { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import styles from './AddTaskForm.module.css';

export default function AddTaskForm({ status }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const { addTask } = useTaskContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTask(trimmed, status);
    setTitle('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button className={styles.addButton} onClick={() => setIsOpen(true)}>
        + 添加任务
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="输入任务标题..."
        autoFocus
      />
      <button type="submit" className={styles.submitButton}>添加</button>
      <button
        type="button"
        className={styles.cancelButton}
        onClick={() => { setIsOpen(false); setTitle(''); }}
      >
        取消
      </button>
    </form>
  );
}
```

- [ ] **Step 3: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/components/AddTaskForm/
git commit -m "feat: 添加新建任务表单组件"
```

---

## Task 7: Column 组件

**Files:**
- Create: `src/components/Column/Column.jsx`, `src/components/Column/Column.module.css`

- [ ] **Step 1: 创建 Column 样式**

```css
/* src/components/Column/Column.module.css */
.column {
  flex: 1;
  min-width: 280px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.25rem;
}

.title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.count {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  background: var(--bg-card);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}

.taskList {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  min-height: 100px;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s;
}

.taskList.over {
  background-color: rgba(83, 52, 131, 0.15);
}
```

- [ ] **Step 2: 创建 Column 组件**

```jsx
// src/components/Column/Column.jsx
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { STATUS_LABELS } from '../../data/constants';
import { useTaskContext } from '../../context/TaskContext';
import TaskCard from '../TaskCard/TaskCard';
import AddTaskForm from '../AddTaskForm/AddTaskForm';
import styles from './Column.module.css';

export default function Column({ status }) {
  const { getTasksByStatus } = useTaskContext();
  const tasks = getTasksByStatus(status);

  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <span className={styles.title}>{STATUS_LABELS[status]}</span>
        <span className={styles.count}>{tasks.length}</span>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`${styles.taskList} ${isOver ? styles.over : ''}`}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      <AddTaskForm status={status} />
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/components/Column/
git commit -m "feat: 添加看板列组件，集成拖放区域"
```

---

## Task 8: Board 组件 + 拖拽逻辑

**Files:**
- Create: `src/components/Board/Board.jsx`, `src/components/Board/Board.module.css`

- [ ] **Step 1: 创建 Board 样式**

```css
/* src/components/Board/Board.module.css */
.board {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow-x: auto;
  min-height: calc(100vh - 56px);
  align-items: flex-start;
}

@media (max-width: 768px) {
  .board {
    scroll-snap-type: x mandatory;
    padding: 1rem;
  }

  .board > * {
    scroll-snap-align: center;
    min-width: 85vw;
  }
}
```

- [ ] **Step 2: 创建 Board 组件**

```jsx
// src/components/Board/Board.jsx
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { COLUMNS } from '../../data/constants';
import { useTaskContext } from '../../context/TaskContext';
import Column from '../Column/Column';
import styles from './Board.module.css';

export default function Board() {
  const { moveTask } = useTaskContext();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    // over.id is the column status (droppable id)
    const newStatus = over.data?.current?.status || over.id;

    // Only move if status actually changed
    if (active.data?.current?.status !== newStatus) {
      moveTask(taskId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {COLUMNS.map((status) => (
          <Column key={status} status={status} />
        ))}
      </div>
    </DndContext>
  );
}
```

- [ ] **Step 3: 更新 App.jsx 接入 Board**

覆盖 `src/App.jsx`：

```jsx
import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import Board from './components/Board/Board';

function App() {
  return (
    <TaskProvider>
      <Navbar />
      <Board />
    </TaskProvider>
  );
}

export default App;
```

- [ ] **Step 4: 启动验证**

```bash
cd "D:/Desktop/待办事项"
npm run dev
```

Expected: 页面显示三列看板，各列有示例任务卡片，可以拖拽卡片到其他列。手机宽度下可横向滑动。

- [ ] **Step 5: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/components/Board/ src/App.jsx
git commit -m "feat: 添加看板主体，实现拖拽移动任务"
```

---

## Task 9: TaskDetailPanel 组件

**Files:**
- Create: `src/components/TaskDetailPanel/TaskDetailPanel.jsx`, `src/components/TaskDetailPanel/TaskDetailPanel.module.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: 创建 TaskDetailPanel 样式**

```css
/* src/components/TaskDetailPanel/TaskDetailPanel.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
}

.panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background: var(--bg-card);
  z-index: 201;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.closeButton {
  align-self: flex-end;
  background: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
}

.closeButton:hover {
  color: var(--text-primary);
}

.titleInput {
  font-size: 1.25rem;
  font-weight: 600;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-primary);
  padding: 0.25rem 0;
  outline: none;
  width: 100%;
}

.titleInput:focus {
  border-bottom-color: var(--accent);
}

.fieldGroup {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.select, .dateInput, .textarea {
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--text-secondary);
  background: var(--bg-main);
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
}

.select:focus, .dateInput:focus, .textarea:focus {
  border-color: var(--accent);
}

.textarea {
  min-height: 120px;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 1rem;
}

.saveButton {
  padding: 0.5rem 1.5rem;
  background: var(--accent);
  color: white;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

.saveButton:hover {
  opacity: 0.9;
}

.deleteButton {
  padding: 0.5rem 1.5rem;
  background: transparent;
  color: var(--priority-high);
  border: 1px solid var(--priority-high);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

.deleteButton:hover {
  background: var(--priority-high);
  color: white;
}
```

- [ ] **Step 2: 创建 TaskDetailPanel 组件**

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
    assignee: '',
    priority: PRIORITIES.MEDIUM,
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    if (selectedTask) {
      setForm({
        title: selectedTask.title,
        status: selectedTask.status,
        assignee: selectedTask.assignee,
        priority: selectedTask.priority,
        dueDate: selectedTask.dueDate,
        description: selectedTask.description,
      });
    }
  }, [selectedTask]);

  if (!selectedTask) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    updateTask(selectedTask.id, form);
    setSelectedTaskId(null);
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个任务吗？')) {
      deleteTask(selectedTask.id);
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
          <select className={styles.select} value={form.assignee} onChange={handleChange('assignee')}>
            <option value="">未指派</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
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
            value={form.dueDate}
            onChange={handleChange('dueDate')}
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

- [ ] **Step 3: 在 App.jsx 中引入 TaskDetailPanel**

覆盖 `src/App.jsx`：

```jsx
import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import Board from './components/Board/Board';
import TaskDetailPanel from './components/TaskDetailPanel/TaskDetailPanel';

function App() {
  return (
    <TaskProvider>
      <Navbar />
      <Board />
      <TaskDetailPanel />
    </TaskProvider>
  );
}

export default App;
```

- [ ] **Step 4: 启动验证**

```bash
cd "D:/Desktop/待办事项"
npm run dev
```

Expected: 点击任务卡片后右侧滑出详情面板，可以编辑所有字段，保存/删除功能正常，点背景可关闭面板。

- [ ] **Step 5: 提交**

```bash
cd "D:/Desktop/待办事项"
git add src/components/TaskDetailPanel/ src/App.jsx
git commit -m "feat: 添加任务详情面板，支持编辑和删除"
```

---

## Task 10: 最终验收和清理

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 更新 HTML 标题**

修改 `index.html` 中的 `<title>` 标签：

```html
<title>TeamTodo - 团队待办事项</title>
```

同时更新 favicon link（如已有则修改）。

- [ ] **Step 2: 全功能验收**

```bash
cd "D:/Desktop/待办事项"
npm run dev
```

验收清单：
1. ✅ 深色主题正确显示
2. ✅ 三列看板（待办/进行中/已完成）正常渲染
3. ✅ 示例任务卡片显示优先级、指派人、截止日期
4. ✅ 拖拽卡片可在列间移动
5. ✅ 点击卡片弹出详情面板
6. ✅ 详情面板可编辑并保存
7. ✅ 删除任务需二次确认
8. ✅ 添加新任务正常工作
9. ✅ 刷新页面后数据保留（localStorage）
10. ✅ 手机宽度下可横向滑动

- [ ] **Step 3: 构建检查**

```bash
cd "D:/Desktop/待办事项"
npm run build
```

Expected: 构建成功，无错误。

- [ ] **Step 4: 最终提交**

```bash
cd "D:/Desktop/待办事项"
git add -A
git commit -m "chore: 更新页面标题，完成 v1.0 基础功能"
```
