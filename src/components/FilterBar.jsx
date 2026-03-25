import './FilterBar.css';

const FILTERS = [
  { key: 'all', label: 'すべて' },
  { key: 'today', label: '今日' },
  { key: 'tomorrow', label: '明日' },
  { key: 'thisweek', label: '今週' },
  { key: 'nextweek', label: '来週以降' },
  { key: 'none', label: '期限なし' },
];

const FilterBar = ({ filter, setFilter }) => {
  return (
    <div className="filter-bar" role="group" aria-label="フィルター">
      {FILTERS.map(f => (
        <button
          key={f.key}
          id={`filter-${f.key}`}
          className={`filter-bar__btn ${filter === f.key ? 'filter-bar__btn--active' : ''}`}
          onClick={() => setFilter(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
