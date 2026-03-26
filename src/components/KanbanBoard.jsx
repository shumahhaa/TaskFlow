import {
  DndContext,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import Column from './Column';
import TaskCard from './TaskCard';
import './KanbanBoard.css';

const STATUSES = ['todo', 'inprogress', 'done'];

const KanbanBoard = ({ getFilteredTasks, getTaskCount, onDragOver, onDragEnd, onEditTask, onAddTask, tasks, onStatusChange }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );


  const handleDragStart = (event) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event) => {
    setActiveTask(null);
    onDragEnd(event);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={isMobile ? [] : sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={`kanban-board ${isMobile ? 'kanban-board--mobile' : ''}`} id="kanban-board">
        {STATUSES.map(status => (
          <Column
            key={status}
            status={status}
            tasks={getFilteredTasks(status)}
            taskCount={getTaskCount(status)}
            onEditTask={onEditTask}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
      <button
        className="kanban-board__add-btn"
        onClick={onAddTask}
        id="add-task-btn"
        aria-label="新規タスクを追加"
      >
        +
      </button>
      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} onEdit={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;

