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
        <h1 className="header__title" style={{ margin: 0 }}>TaskFlow</h1>
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
            onClick={handleLogout}
            style={{
              padding: '6px 12px', fontSize: '0.85rem', backgroundColor: '#f1f5f9',
              color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px',
              cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
          >
            ログアウト
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
