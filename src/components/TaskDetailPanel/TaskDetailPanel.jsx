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
