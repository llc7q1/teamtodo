import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import Board from './components/Board/Board';

function App() {
  return (
    <TaskProvider>
      <Navbar />
      <Board />
    </TaskProvider>
  );
}

export default App;
