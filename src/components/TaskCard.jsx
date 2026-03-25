import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './TaskCard.css';

const TIME_LABEL_MAP = {
  today: '今日',
  tomorrow: '明日',
  thisweek: '今週',
  nextweek: '来週以降',
  none: '期限なし',
};

const PRIORITY_LABEL_MAP = {
  high: '高',
  medium: '中',
  low: '低',
};

const TaskCard = ({ task, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e) => {
    // Don't open modal if user is dragging
    if (!isDragging) {
      onEdit(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${isDragging ? 'task-card--dragging' : ''}`}
      onClick={handleClick}
      id={`task-${task.id}`}
    >
      <div className={`task-card__priority-indicator task-card__priority-indicator--${task.priority}`} />
      <div className="task-card__title">{task.title}</div>
      <div className="task-card__meta">
        <span className={`badge badge--${task.priority}`}>
          {PRIORITY_LABEL_MAP[task.priority]}
        </span>
        <span className={`task-card__time-label task-card__time-label--${task.timeLabel}`}>
          {TIME_LABEL_MAP[task.timeLabel]}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
