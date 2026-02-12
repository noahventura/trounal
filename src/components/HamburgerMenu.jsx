import { useState, useRef, useEffect } from 'react';
import './HamburgerMenu.css';

function HamburgerMenu({ onOpenStatistics }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMenuItemClick = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="hamburger-menu" ref={menuRef}>
      <button
        className={`hamburger-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {isOpen && (
        <div className="menu-dropdown">
          <button
            className="menu-item"
            onClick={() => handleMenuItemClick(onOpenStatistics)}
          >
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Statistics
          </button>
        </div>
      )}
    </div>
  );
}

export default HamburgerMenu;
