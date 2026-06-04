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
