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
