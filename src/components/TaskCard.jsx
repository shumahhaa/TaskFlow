import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CircleDashed, Rocket, CheckCircle2 } from 'lucide-react';
import './TaskCard.css';
const TIME_LABEL_MAP = {
  morning: '午前',
  afternoon: '午後',
  night: '夜',
  none: '未定',
};

const PRIORITY_LABEL_MAP = {
  high: 'A',
  medium: 'B',
  low: 'C',
};

const STATUS_ORDER = ['todo', 'inprogress', 'done'];
const STATUS_LABEL = {
  todo: '未着手',
  inprogress: '進行中',
  done: '完了',
};
const STATUS_ICONS = {
  todo: CircleDashed,
  inprogress: Rocket,
  done: CheckCircle2,
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
          {task.duration != null && (
            <span className="task-card__duration">
              ⏱ {task.duration}分
            </span>
          )}
        </div>
        
        {onStatusChange && (
          <div className="task-card__quick-actions">
            {STATUS_ORDER.filter(s => s !== task.status).map((targetStatus) => {
              const IconComponent = STATUS_ICONS[targetStatus];
              return (
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
                <IconComponent size={15} strokeWidth={2.5} />
              </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
