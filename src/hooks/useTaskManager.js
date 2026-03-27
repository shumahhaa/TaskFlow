import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const COLUMN_IDS = ['todo', 'inprogress', 'done'];

// Helper: build path for the user's tasks
const getTasksRef = (userId) => collection(db, 'users', userId, 'tasks');

// Helper: reassign clean order values (0, 1, 2, ...) to tasks in a column
// Returns the updated task objects with new orders
function getCleanOrderedTasks(tasks, status) {
  const sorted = tasks
    .filter(t => t.status === status)
    .sort((a, b) => a.order - b.order);
    
  return sorted.map((t, i) => ({ ...t, order: i }));
}

// Helper: find which column a task or droppable belongs to
function findColumn(taskId, tasks) {
  if (COLUMN_IDS.includes(taskId)) return taskId;
  const task = tasks.find(t => t.id === taskId);
  return task ? task.status : null;
}

export function useTaskManager(user) {
  const [tasks, setTasks] = useState([]);
  const serverTasksRef = useRef([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', task: null });
  const [isReady, setIsReady] = useState(false);

  // Sync with Firestore
  useEffect(() => {
    if (!user) {
      setTasks([]);
      serverTasksRef.current = [];
      setIsReady(false);
      return;
    }

    const unsubscribe = onSnapshot(getTasksRef(user.uid), (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(fetchedTasks);
      serverTasksRef.current = fetchedTasks;
      setIsReady(true);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // --- CRUD ---
  const addTask = useCallback(async (taskData) => {
    if (!user) return;
    const newId = crypto.randomUUID();
    const newTask = {
      title: taskData.title,
      priority: taskData.priority,
      status: 'todo',
      order: Date.now(), // temporary order to be last
      createdAt: Date.now(),
      completedAt: null,
    };
    
    // Using setDoc with generated ID allows us to use it immediately if needed
    try {
      await setDoc(doc(db, 'users', user.uid, 'tasks', newId), newTask);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }, [user]);

  const updateTask = useCallback(async (id, updates) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedData = { ...updates };
    if (updates.status === 'done' && task.status !== 'done') {
      updatedData.completedAt = Date.now();
    }
    if (updates.status && updates.status !== 'done' && task.status === 'done') {
      updatedData.completedAt = null;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid, 'tasks', id), updatedData);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  }, [user, tasks]);

  const deleteTask = useCallback(async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  }, [user]);

  // --- Auto-delete done tasks older than 24 hours ---
  useEffect(() => {
    if (!user || !isReady) return;

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    const checkAndDeleteExpiredTasks = () => {
      const now = Date.now();
      const expiredTasks = serverTasksRef.current.filter(t => 
        t.status === 'done' && 
        t.completedAt && 
        (now - t.completedAt >= TWENTY_FOUR_HOURS)
      );

      expiredTasks.forEach(task => {
        deleteTask(task.id);
      });
    };

    checkAndDeleteExpiredTasks();
    const intervalId = setInterval(checkAndDeleteExpiredTasks, 60000); // 1分ごとにチェック

    return () => clearInterval(intervalId);
  }, [user, isReady, deleteTask]);

  // --- D&D: onDragOver (cross-column real-time move) ---
  const handleDragOver = useCallback((event) => {
    // In a fully synchronous cloud app, doing DB writes on every hover (DragOver) is too expensive.
    // Therefore, we only perform optimistic UI updates during drag over, or wait for DragEnd.
    // Dnd-kit sortable usually needs state updates to show animations.
    
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = findColumn(activeId, tasks);
    const overColumn = findColumn(overId, tasks);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    // Cross-column move: Just update local state for UI responsiveness.
    // Real save will happen in onDragEnd.
    setTasks(prev => {
      const activeTask = prev.find(t => t.id === activeId);
      if (!activeTask) return prev;

      const overColumnTasks = prev
        .filter(t => t.status === overColumn && t.id !== activeId)
        .sort((a, b) => a.order - b.order);

      let newIndex = overColumnTasks.findIndex(t => t.id === overId);
      if (newIndex === -1) newIndex = overColumnTasks.length;

      return prev.map(t => {
        if (t.id === activeId) {
          return { ...t, status: overColumn, order: newIndex - 0.5 };
        }
        return t;
      });
    });
  }, [tasks]);

  // --- D&D: onDragEnd (within-column reorder + finalize) ---
  const handleDragEnd = useCallback(async (event) => {
    if (!user) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    // Get true original status from server state before eager UI updates
    const serverTask = serverTasksRef.current.find(t => t.id === activeId);
    const activeColumn = serverTask ? serverTask.status : findColumn(activeId, tasks);
    const overColumn = findColumn(overId, tasks);
    if (!activeColumn || !overColumn) return;

    // Since onDragOver might have modified the local state, tasks array already has 
    // the item in the new column. We just need to fix ordering and persist.
    
    // We create a fresh copy of tasks to manipulate securely before batching
    let updatedTasks = [...tasks];
    const taskToMove = updatedTasks.find(t => t.id === activeId);
    
    if (!taskToMove) return;

    let targetColumnTasks;

    if (activeColumn === overColumn) {
      // 同一カラム内の並び替え: arrayMove パターン
      let columnTasks = updatedTasks
        .filter(t => t.status === overColumn)
        .sort((a, b) => a.order - b.order);

      const oldIndex = columnTasks.findIndex(t => t.id === activeId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      // arrayMove: 元の位置から削除して新しい位置に挿入
      const [moved] = columnTasks.splice(oldIndex, 1);
      columnTasks.splice(newIndex, 0, moved);

      targetColumnTasks = columnTasks;
    } else {
      // クロスカラム移動
      targetColumnTasks = updatedTasks
        .filter(t => t.status === overColumn && t.id !== activeId)
        .sort((a, b) => a.order - b.order);

      let dropIndex = targetColumnTasks.findIndex(t => t.id === overId);
      if (dropIndex === -1) dropIndex = targetColumnTasks.length;
      targetColumnTasks.splice(dropIndex, 0, taskToMove);
    }

    // Now targetColumnTasks has the new exact ordering.
    // Create a batch to rewrite orders of this column.
    const batch = writeBatch(db);
    let orderChangedCount = 0;

    targetColumnTasks.forEach((t, index) => {
      // Reassign only if order is different, or if it changed status/completed state
      const isMovedTask = t.id === activeId;
      
      let updates = {};
      if (t.order !== index) updates.order = index;
      
      if (isMovedTask) {
        // If moving cross-column, enforce the new status update since t.status was eagerly changed
        if (activeColumn !== overColumn) {
          updates.status = overColumn;
          if (overColumn === 'done') {
            updates.completedAt = Date.now();
          } else {
            updates.completedAt = null;
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        const ref = doc(db, 'users', user.uid, 'tasks', t.id);
        batch.update(ref, updates);
        orderChangedCount++;
      }
    });

    if (activeColumn !== overColumn) {
      // If it changed columns, also clean up the source column orders
      const sourceColumnTasks = updatedTasks
        .filter(t => t.status === activeColumn && t.id !== activeId)
        .sort((a, b) => a.order - b.order);
        
      sourceColumnTasks.forEach((t, index) => {
        if (t.order !== index) {
          const ref = doc(db, 'users', user.uid, 'tasks', t.id);
          batch.update(ref, { order: index });
          orderChangedCount++;
        }
      });
    }

    if (orderChangedCount > 0) {
      try {
        await batch.commit();
      } catch (error) {
        console.error("Error committing batch:", error);
      }
    }
  }, [tasks, user]);

  // --- Filtering ---
  const getFilteredTasks = useCallback((status) => {
    return tasks
      .filter(t => t.status === status)
      .sort((a, b) => a.order - b.order);
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
    return tasks.filter(t => t.status === status).length;
  }, [tasks]);

  return {
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
    isReady,
  };
}
