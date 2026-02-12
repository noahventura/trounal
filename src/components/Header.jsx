import { useAuth } from '../firebase/AuthContext';
import HamburgerMenu from './HamburgerMenu';
import './Header.css';

function Header({ onOpenStatistics, onOpenHistory }) {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="header">
      {currentUser && (
        <HamburgerMenu onOpenStatistics={onOpenStatistics} onOpenHistory={onOpenHistory} />
      )}
      <h1 className="logo">TROUNAL</h1>
      {currentUser && (
        <div className="user-section">
          <span className="user-name">{currentUser.displayName || currentUser.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
