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
