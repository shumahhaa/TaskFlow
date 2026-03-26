import { useState, useEffect } from 'react';
import './TaskModal.css';

const TaskModal = ({ isOpen, mode, task, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [timeLabel, setTimeLabel] = useState('today');
  const [status, setStatus] = useState('todo');

  useEffect(() => {
    if (mode === 'edit' && task) {
      setTitle(task.title);
      setPriority(task.priority);
      setTimeLabel(task.timeLabel);
      setStatus(task.status || 'todo');
    } else {
      setTitle('');
      setPriority('medium');
      setTimeLabel('today');
      setStatus('todo');
    }
  }, [mode, task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const saveData = {
      title: title.trim(),
      priority,
      timeLabel,
    };
    if (mode === 'edit') {
      saveData.status = status;
    }
    onSave(saveData);
    onClose();
  };

  const handleDelete = () => {
    if (task) {
      onDelete(task.id);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} id="task-modal-overlay">
      <div className="modal" id="task-modal">
        <button className="modal__close" onClick={onClose} aria-label="閉じる">
          ✕
        </button>
        <h2 className="modal__title">
          {mode === 'create' ? '新規タスク' : 'タスクを編集'}
        </h2>
        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label className="modal__label" htmlFor="task-title">タイトル</label>
            <input
              id="task-title"
              className="modal__input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスク名を入力..."
              autoFocus
              required
            />
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="task-priority">優先度</label>
            <select
              id="task-priority"
              className="modal__select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="high">🔴 高</option>
              <option value="medium">🟡 中</option>
              <option value="low">🟢 低</option>
            </select>
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="task-time-label">時間ラベル</label>
            <select
              id="task-time-label"
              className="modal__select"
              value={timeLabel}
              onChange={(e) => setTimeLabel(e.target.value)}
            >
              <option value="today">今日</option>
              <option value="tomorrow">明日</option>
              <option value="thisweek">今週</option>
              <option value="nextweek">来週以降</option>
              <option value="none">期限なし</option>
            </select>
          </div>

          {mode === 'edit' && (
            <div className="modal__field">
              <label className="modal__label" htmlFor="task-status">ステータス</label>
              <div className="modal__status-group" id="task-status">
                <button
                  type="button"
                  className={`modal__status-btn modal__status-btn--todo ${status === 'todo' ? 'modal__status-btn--active' : ''}`}
                  onClick={() => setStatus('todo')}
                >
                  未着手
                </button>
                <button
                  type="button"
                  className={`modal__status-btn modal__status-btn--inprogress ${status === 'inprogress' ? 'modal__status-btn--active' : ''}`}
                  onClick={() => setStatus('inprogress')}
                >
                  進行中
                </button>
                <button
                  type="button"
                  className={`modal__status-btn modal__status-btn--done ${status === 'done' ? 'modal__status-btn--active' : ''}`}
                  onClick={() => setStatus('done')}
                >
                  完了
                </button>
              </div>
            </div>
          )}

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
              キャンセル
            </button>
            {mode === 'edit' && (
              <button
                type="button"
                className="modal__btn modal__btn--danger"
                onClick={handleDelete}
              >
                削除
              </button>
            )}
            <button
              type="submit"
              className="modal__btn modal__btn--primary"
              disabled={!title.trim()}
            >
              {mode === 'create' ? '作成' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
