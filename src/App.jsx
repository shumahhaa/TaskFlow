import { useTaskManager } from './hooks/useTaskManager';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import ArchivePage from './components/ArchivePage';

function App() {
  const {
    tasks,
    filter,
    setFilter,
    currentPage,
    setCurrentPage,
    modalState,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    handleDragOver,
    handleDragEnd,
    getFilteredTasks,
    archivedTasks,
    openCreateModal,
    openEditModal,
    closeModal,
    getTaskCount,
  } = useTaskManager();

  const handleSave = (taskData) => {
    if (modalState.mode === 'create') {
      addTask(taskData);
    } else if (modalState.task) {
      updateTask(modalState.task.id, taskData);
    }
  };

  return (
    <>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {currentPage === 'board' ? (
        <>
          <FilterBar filter={filter} setFilter={setFilter} />
          <KanbanBoard
            tasks={tasks.filter(t => !t.archived)}
            getFilteredTasks={getFilteredTasks}
            getTaskCount={getTaskCount}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onEditTask={openEditModal}
            onAddTask={openCreateModal}
          />
        </>
      ) : (
        <ArchivePage
          archivedTasks={archivedTasks}
          onRestore={restoreTask}
          onDelete={deleteTask}
        />
      )}

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

export default App;
