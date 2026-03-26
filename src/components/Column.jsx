import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import './Column.css';

const COLUMN_CONFIG = {
  todo: { label: '未着手' },
  inprogress: { label: '進行中' },
  done: { label: '完了', description: '24時間後に消去' },
};

const Column = ({ status, tasks, onEditTask, taskCount, onStatusChange }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status];
  const taskIds = tasks.map(t => t.id);

  return (
    <div
      className={`column ${isOver ? 'column--over' : ''}`}
      id={`column-${status}`}
    >
      <div className="column__header">
        <div className="column__title">
          <span className={`column__status-dot column__status-dot--${status}`} />
          <span>{config.label}</span>
          {config.description && <span className="column__description">{config.description}</span>}
        </div>
        <span className="column__count">{taskCount}</span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="column__tasks">
          {tasks.length === 0 ? (
            <div className="column__empty">タスクをここにドロップ</div>
          ) : (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} onStatusChange={onStatusChange} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default Column;
