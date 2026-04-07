import { useState, useEffect } from 'react';
import './TaskModal.css';

const TaskModal = ({ isOpen, mode, task, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [timeLabel, setTimeLabel] = useState('morning');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (mode === 'edit' && task) {
      setTitle(task.title);
      setPriority(task.priority);
      setTimeLabel(task.timeLabel);
      setDuration(task.duration != null ? String(task.duration) : '');
    } else {
      setTitle('');
      setPriority('medium');
      setTimeLabel('morning');
      setDuration('');
    }
  }, [mode, task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedDuration = duration !== '' ? parseInt(duration, 10) : null;
    const saveData = {
      title: title.trim(),
      priority,
      timeLabel,
      duration: parsedDuration !== null && !isNaN(parsedDuration) ? parsedDuration : null,
    };
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
              <option value="high">A</option>
              <option value="medium">B</option>
              <option value="low">C</option>
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
              <option value="morning">午前</option>
              <option value="afternoon">午後</option>
              <option value="night">夜</option>
              <option value="none">未定</option>
            </select>
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="task-duration">所要時間（分）</label>
            <div className="modal__duration-wrapper">
              <input
                id="task-duration"
                className="modal__input modal__input--duration"
                type="number"
                min="1"
                max="999"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="例: 30"
              />
              <span className="modal__duration-unit">分</span>
            </div>
          </div>

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
