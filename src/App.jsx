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
