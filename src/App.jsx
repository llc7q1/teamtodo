// src/App.jsx
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import Board from './components/Board/Board';
import TaskDetailPanel from './components/TaskDetailPanel/TaskDetailPanel';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function AppContent() {
  const { isLoggedIn, loading, login, register, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '1.125rem',
      }}>
        加载中...
      </div>
    );
  }

  if (!isLoggedIn) {
    if (authMode === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthMode('login')}
          onRegister={async (username, password, displayName) => {
            await register(username, password, displayName);
            setAuthMode('login');
          }}
        />
      );
    }
    return (
      <Login
        onSwitchToRegister={() => setAuthMode('register')}
        onLogin={login}
      />
    );
  }

  return (
    <TaskProvider>
      <Navbar />
      <Board />
      <TaskDetailPanel />
    </TaskProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
