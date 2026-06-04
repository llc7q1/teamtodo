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
