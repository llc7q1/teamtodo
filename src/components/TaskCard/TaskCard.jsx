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
