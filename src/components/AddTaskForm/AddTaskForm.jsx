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
