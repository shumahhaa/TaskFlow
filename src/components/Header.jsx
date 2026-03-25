import './Header.css';

const Header = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="header">
      <h1 className="header__title">TaskFlow</h1>
      <nav className="header__nav">
        <button
          id="nav-board"
          className={`header__nav-btn ${currentPage === 'board' ? 'header__nav-btn--active' : ''}`}
          onClick={() => setCurrentPage('board')}
        >
          📋 ボード
        </button>
        <button
          id="nav-archive"
          className={`header__nav-btn ${currentPage === 'archive' ? 'header__nav-btn--active' : ''}`}
          onClick={() => setCurrentPage('archive')}
        >
          📦 アーカイブ
        </button>
      </nav>
    </header>
  );
};

export default Header;
