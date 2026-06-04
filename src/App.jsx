import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import Board from './components/Board/Board';
import TaskDetailPanel from './components/TaskDetailPanel/TaskDetailPanel';

function App() {
  return (
    <TaskProvider>
      <Navbar />
      <Board />
      <TaskDetailPanel />
    </TaskProvider>
  );
}

export default App;
