import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <TaskProvider>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>看板区域即将到来...</p>
      </main>
    </TaskProvider>
  );
}

export default App;
