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

const STATUS_ORDER = ['todo', 'inprogress', 'done'];
const STATUS_LABEL = {
  todo: '未着手',
  inprogress: '進行中',
  done: '完了',
};

const TaskCard = ({ task, onEdit, onStatusChange }) => {
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
      className={`task-card task-card--priority-${task.priority} ${isDragging ? 'task-card--dragging' : ''}`}
      onClick={handleClick}
      id={`task-${task.id}`}
    >
      <div className="task-card__title" title={task.title}>{task.title}</div>
      <div className="task-card__footer">
        <div className="task-card__meta">
          <span className={`badge badge--${task.priority}`}>
            {PRIORITY_LABEL_MAP[task.priority]}
          </span>
          <span className={`task-card__time-tag task-card__time-tag--${task.timeLabel}`}>
            {TIME_LABEL_MAP[task.timeLabel]}
          </span>
        </div>
        
        {onStatusChange && (
          <div className="task-card__quick-actions">
            {STATUS_ORDER.filter(s => s !== task.status).map((targetStatus) => (
              <button
                key={targetStatus}
                className={`task-card__action-btn task-card__action-btn--to-${targetStatus}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, targetStatus);
                }}
                aria-label={`${STATUS_LABEL[targetStatus]}へ移動`}
                title={`${STATUS_LABEL[targetStatus]}へ移動`}
              >
                {STATUS_LABEL[targetStatus]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
