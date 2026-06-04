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
