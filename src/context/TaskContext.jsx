// src/context/TaskContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch tasks and users on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksData, usersData] = await Promise.all([
          api.get('/tasks'),
          api.get('/users'),
        ]);
        setTasks(tasksData);
        setUsers(usersData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const addTask = useCallback(async (title, status) => {
    const newTask = await api.post('/tasks', { title, status });
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    const updated = await api.put(`/tasks/${id}`, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTaskId(null);
  }, []);

  const moveTask = useCallback(async (taskId, newStatus) => {
    const updated = await api.put(`/tasks/${taskId}`, { status: newStatus });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  }, []);

  const getTasksByStatus = useCallback(
    (status) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontFamily: 'Outfit, sans-serif',
      }}>
        加载任务中...
      </div>
    );
  }

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
