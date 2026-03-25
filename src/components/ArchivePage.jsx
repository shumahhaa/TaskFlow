import './ArchivePage.css';

const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' };
const TIME_LABEL = {
  today: '今日',
  tomorrow: '明日',
  thisweek: '今週',
  nextweek: '来週以降',
  none: '期限なし',
};

const ArchivePage = ({ archivedTasks, onRestore, onDelete }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="archive-page" id="archive-page">
      <div className="archive-page__header">
        <h2 className="archive-page__title">📦 アーカイブ</h2>
        <p className="archive-page__subtitle">
          完了後24時間経過したタスクが自動的にアーカイブされます
        </p>
      </div>

      {archivedTasks.length === 0 ? (
        <div className="archive-page__empty">
          <div className="archive-page__empty-icon">📭</div>
          <p className="archive-page__empty-text">アーカイブされたタスクはありません</p>
        </div>
      ) : (
        <div className="archive-page__list">
          {archivedTasks.map(task => (
            <div key={task.id} className="archive-card" id={`archive-${task.id}`}>
              <div className="archive-card__title">{task.title}</div>
              <div className="archive-card__meta">
                <span className={`badge badge--${task.priority}`}>
                  {PRIORITY_LABEL[task.priority]}
                </span>
                <span className={`task-card__time-label task-card__time-label--${task.timeLabel}`}>
                  {TIME_LABEL[task.timeLabel]}
                </span>
                <span className="archive-card__date">
                  完了: {formatDate(task.completedAt)}
                </span>
              </div>
              <div className="archive-card__actions">
                <button
                  className="archive-card__btn archive-card__btn--restore"
                  onClick={() => onRestore(task.id)}
                >
                  ↩ 復元
                </button>
                <button
                  className="archive-card__btn archive-card__btn--delete"
                  onClick={() => onDelete(task.id)}
                >
                  🗑 完全削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivePage;
