import { useState, useEffect, useCallback, useMemo } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { loadTasks, saveTasks } from '../utils/storage';

const ARCHIVE_DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours
const ARCHIVE_CHECK_INTERVAL_MS = 60 * 1000;   // 1 minute
const COLUMN_IDS = ['todo', 'inprogress', 'done'];

// Helper: reassign clean order values (0, 1, 2, ...) to tasks in a column
function reassignOrders(tasks, status) {
  const sorted = tasks
    .filter(t => t.status === status && !t.archived)
    .sort((a, b) => a.order - b.order);
  const orderMap = new Map();
  sorted.forEach((t, i) => orderMap.set(t.id, i));
  return tasks.map(t => {
    if (orderMap.has(t.id)) {
      return { ...t, order: orderMap.get(t.id) };
    }
    return t;
  });
}

// Helper: find which column a task or droppable belongs to
function findColumn(taskId, tasks) {
  if (COLUMN_IDS.includes(taskId)) return taskId;
  const task = tasks.find(t => t.id === taskId);
  return task ? task.status : null;
}

export function useTaskManager() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState('board');
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', task: null });

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Auto-archive: check every minute for tasks completed > 24h ago
  useEffect(() => {
    const checkArchive = () => {
      const now = Date.now();
      setTasks(prev => {
        const updated = prev.map(task => {
          if (
            task.status === 'done' &&
            !task.archived &&
            task.completedAt &&
            now - task.completedAt >= ARCHIVE_DELAY_MS
          ) {
            return { ...task, archived: true };
          }
          return task;
        });
        const hasChanged = updated.some((t, i) => t !== prev[i]);
        return hasChanged ? updated : prev;
      });
    };

    checkArchive();
    const interval = setInterval(checkArchive, ARCHIVE_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // --- CRUD ---
  const addTask = useCallback((taskData) => {
    const newTask = {
      id: crypto.randomUUID(),
      title: taskData.title,
      priority: taskData.priority,
      timeLabel: taskData.timeLabel,
      status: 'todo',
      order: Date.now(),
      createdAt: Date.now(),
      completedAt: null,
      archived: false,
    };
    setTasks(prev => {
      const updated = [...prev, newTask];
      return reassignOrders(updated, 'todo');
    });
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      const updated = { ...task, ...updates };
      if (updates.status === 'done' && task.status !== 'done') {
        updated.completedAt = Date.now();
      }
      if (updates.status && updates.status !== 'done' && task.status === 'done') {
        updated.completedAt = null;
        updated.archived = false;
      }
      return updated;
    }));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const restoreTask = useCallback((id) => {
    setTasks(prev => {
      const updated = prev.map(task => {
        if (task.id !== id) return task;
        return { ...task, status: 'todo', completedAt: null, archived: false, order: Date.now() };
      });
      return reassignOrders(updated, 'todo');
    });
  }, []);

  // --- D&D: onDragOver (cross-column real-time move) ---
  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    setTasks(prev => {
      const activeId = active.id;
      const overId = over.id;

      const activeColumn = findColumn(activeId, prev);
      const overColumn = findColumn(overId, prev);

      if (!activeColumn || !overColumn || activeColumn === overColumn) return prev;

      // Cross-column move: move active task to the target column
      const activeTask = prev.find(t => t.id === activeId);
      if (!activeTask) return prev;

      // Get sorted tasks in the target column
      const overColumnTasks = prev
        .filter(t => t.status === overColumn && !t.archived && t.id !== activeId)
        .sort((a, b) => a.order - b.order);

      // Find insertion index
      let newIndex;
      const overTask = prev.find(t => t.id === overId);
      if (overTask) {
        newIndex = overColumnTasks.findIndex(t => t.id === overId);
        if (newIndex === -1) newIndex = overColumnTasks.length;
      } else {
        // Dropped on a column itself
        newIndex = overColumnTasks.length;
      }

      // Update the task's status
      let updated = prev.map(t => {
        if (t.id !== activeId) return t;
        const movedTask = { ...t, status: overColumn, order: newIndex - 0.5 };
        if (overColumn === 'done' && t.status !== 'done') {
          movedTask.completedAt = Date.now();
        }
        if (overColumn !== 'done' && t.status === 'done') {
          movedTask.completedAt = null;
          movedTask.archived = false;
        }
        return movedTask;
      });

      // Reassign clean orders in both columns
      updated = reassignOrders(updated, activeColumn);
      updated = reassignOrders(updated, overColumn);
      return updated;
    });
  }, []);

  // --- D&D: onDragEnd (within-column reorder + finalize) ---
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    setTasks(prev => {
      const activeColumn = findColumn(activeId, prev);
      const overColumn = findColumn(overId, prev);

      if (!activeColumn || !overColumn) return prev;

      // Same column: reorder using arrayMove
      if (activeColumn === overColumn) {
        const columnTasks = prev
          .filter(t => t.status === activeColumn && !t.archived)
          .sort((a, b) => a.order - b.order);

        const oldIndex = columnTasks.findIndex(t => t.id === activeId);
        const newIndex = columnTasks.findIndex(t => t.id === overId);

        if (oldIndex === -1 || newIndex === -1) return prev;

        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        const orderMap = new Map();
        reordered.forEach((t, i) => orderMap.set(t.id, i));

        return prev.map(t => {
          if (orderMap.has(t.id)) {
            return { ...t, order: orderMap.get(t.id) };
          }
          return t;
        });
      }

      // Cross-column: task was already moved in onDragOver,
      // so we just need to finalize position based on where it was dropped
      const overTask = prev.find(t => t.id === overId);
      const columnTasks = prev
        .filter(t => t.status === overColumn && !t.archived)
        .sort((a, b) => a.order - b.order);

      const activeIndex = columnTasks.findIndex(t => t.id === activeId);

      if (overTask) {
        const overIndex = columnTasks.findIndex(t => t.id === overId);
        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          const reordered = arrayMove(columnTasks, activeIndex, overIndex);
          const orderMap = new Map();
          reordered.forEach((t, i) => orderMap.set(t.id, i));
          return prev.map(t => {
            if (orderMap.has(t.id)) {
              return { ...t, order: orderMap.get(t.id) };
            }
            return t;
          });
        }
      }

      // Final cleanup: reassign orders
      let updated = reassignOrders(prev, activeColumn);
      updated = reassignOrders(updated, overColumn);
      return updated;
    });
  }, []);

  // --- Filtering ---
  const getFilteredTasks = useCallback((status) => {
    return tasks
      .filter(t => {
        if (t.archived) return false;
        if (t.status !== status) return false;
        if (filter === 'all') return true;
        return t.timeLabel === filter;
      })
      .sort((a, b) => a.order - b.order);
  }, [tasks, filter]);

  const archivedTasks = useMemo(() => {
    return tasks
      .filter(t => t.archived)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }, [tasks]);

  // --- Modal helpers ---
  const openCreateModal = useCallback(() => {
    setModalState({ isOpen: true, mode: 'create', task: null });
  }, []);

  const openEditModal = useCallback((task) => {
    setModalState({ isOpen: true, mode: 'edit', task });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, mode: 'create', task: null });
  }, []);

  // --- Task counts ---
  const getTaskCount = useCallback((status) => {
    return tasks.filter(t => {
      if (t.archived) return false;
      if (t.status !== status) return false;
      if (filter === 'all') return true;
      return t.timeLabel === filter;
    }).length;
  }, [tasks, filter]);

  return {
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
  };
}
