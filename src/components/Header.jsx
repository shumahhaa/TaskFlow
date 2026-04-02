import { useState, useRef, useEffect } from 'react';
import { auth, signOut } from '../utils/firebase';
import './Header.css';

const Header = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="header">
      <div className="header__logo-wrapper">
        <img 
          src="/src/assets/logo.png" 
          alt="今日やる！" 
          className="header__logo"
        />
      </div>

      {user && (
        <div className="header__menu-container" ref={menuRef}>
          <button 
            className={`header__hamburger ${isMenuOpen ? 'header__hamburger--open' : ''}`}
            onClick={toggleMenu}
            aria-label="メニュー"
          >
            <span className="header__hamburger-line"></span>
            <span className="header__hamburger-line"></span>
            <span className="header__hamburger-line"></span>
          </button>

          {isMenuOpen && (
            <div className="header__dropdown glass">
              <div className="header__user-info">
                <img 
                  src={user.photoURL} 
                  alt="User Avatar" 
                  className="header__avatar-large"
                  referrerPolicy="no-referrer"
                />
                <div className="header__user-details">
                  <span className="header__user-name">{user.displayName}</span>
                  <span className="header__user-email">{user.email || 'Googleアカウント'}</span>
                </div>
              </div>
              <div className="header__divider"></div>
              <button 
                className="header__logout-btn-menu"
                onClick={handleLogout}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                ログアウト
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
