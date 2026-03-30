import { auth, signOut } from '../utils/firebase';
import './Header.css';

const Header = ({ user }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h1 className="header__title" style={{ margin: 0 }}>KyouYaru</h1>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src={user.photoURL} 
              alt="User Avatar" 
              title={user.displayName}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            className="header__logout-btn"
            onClick={handleLogout}
            title="ログアウト"
          >
            ログアウト
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
