import { useTaskManager } from './hooks/useTaskManager';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';

import { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from './utils/firebase';

function MainApp({ user }) {
  const {
    tasks,
    modalState,
    addTask,
    updateTask,
    deleteTask,
    handleDragOver,
    handleDragEnd,
    getFilteredTasks,
    openCreateModal,
    openEditModal,
    closeModal,
    getTaskCount,
  } = useTaskManager(user);

  const handleSave = (taskData) => {
    if (modalState.mode === 'create') {
      addTask(taskData);
    } else if (modalState.task) {
      updateTask(modalState.task.id, taskData);
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  return (
    <>
      <Header user={user} />

      <KanbanBoard
        tasks={tasks}
        getFilteredTasks={getFilteredTasks}
        getTaskCount={getTaskCount}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onEditTask={openEditModal}
        onAddTask={openCreateModal}
        onStatusChange={handleStatusChange}
      />

      <TaskModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        task={modalState.task}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={deleteTask}
      />
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)', padding: '20px' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--text-primary)', margin: '0 0 16px 0', letterSpacing: '-1px' }}>KyouYaru</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px', textAlign: 'center', lineHeight: '1.6' }}>
          クラウド保存に対応しました。<br />
          Googleアカウントでログインして、スマホとPCでタスクを安全に同期しましょう。
        </p>
        <button 
          onClick={handleLogin}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 28px', fontSize: '1.1rem', fontWeight: 'bold',
            backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', 
            border: '1px solid var(--border-light)', borderRadius: '12px', 
            cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -4px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Googleで安全にログイン
        </button>
      </div>
    );
  }

  return <MainApp user={user} />;
}

export default App;
