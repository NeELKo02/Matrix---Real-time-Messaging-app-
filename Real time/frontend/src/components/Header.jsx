import React, { useState, useRef, useEffect } from 'react';

const Header = ({ user, roomInfo, connected, onSignOut, onThemeToggle, isDark }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getConnectionStatus = () => {
    if (connected) {
      return { text: 'Connected', color: '#2eb886', icon: '🟢' };
    } else {
      return { text: 'Connecting...', color: '#e01e5a', icon: '🔴' };
    }
  };

  const status = getConnectionStatus();
  
  // Handle DM room display names
  const getRoomDisplayName = () => {
    if (!roomInfo.room) return 'general';
    if (roomInfo.room.startsWith('dm_')) {
      return 'Direct Message';
    }
    return roomInfo.room;
  };
  
  const roomDisplayName = getRoomDisplayName();
  const onlineCount = roomInfo.users?.length || 0;

  return (
    <header className="chat-header">
      {/* Left Section - Room Info */}
      <div className="header-left">
        <div className="room-info">
          <h1 className="room-title">#{roomDisplayName}</h1>
          <div className="room-meta">
            <span className="connection-status" style={{ color: status.color }}>
              {status.icon} {status.text}
            </span>
            {connected && onlineCount > 0 && (
              <>
                <span className="meta-separator">•</span>
                <span className="member-count">{onlineCount} members</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="header-right">
        {/* Search */}
        <button className="header-action" title="Search">
          🔍
        </button>

        {/* Notifications */}
        <button className="header-action" title="Notifications">
          🔔
        </button>

        {/* Theme Toggle */}
        <button 
          className="header-action" 
          onClick={onThemeToggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* User Menu */}
        <div className="user-menu-container" ref={menuRef}>
          <button 
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="User menu"
          >
            <div className="user-avatar-small">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className={`status-dot ${connected ? 'online' : 'offline'}`}></div>
            </div>
            <span className="user-name">{user?.displayName || 'User'}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="user-info-large">
                  <div className="user-avatar-large">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className={`status-indicator ${connected ? 'online' : 'offline'}`}></div>
                  </div>
                  <div className="user-details">
                    <div className="user-name-large">{user?.displayName || 'User'}</div>
                    <div className="user-email">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <div className="dropdown-section">
                <button className="dropdown-item">
                  <span className="item-icon">👤</span>
                  <span>Profile</span>
                </button>
                <button className="dropdown-item">
                  <span className="item-icon">⚙️</span>
                  <span>Preferences</span>
                </button>
                <button className="dropdown-item">
                  <span className="item-icon">🔔</span>
                  <span>Notifications</span>
                </button>
                <button className="dropdown-item">
                  <span className="item-icon">🎨</span>
                  <span>Themes</span>
                </button>
              </div>

              <div className="dropdown-divider"></div>

              <div className="dropdown-section">
                <button className="dropdown-item">
                  <span className="item-icon">❓</span>
                  <span>Help & Support</span>
                </button>
                <button className="dropdown-item">
                  <span className="item-icon">📋</span>
                  <span>Keyboard Shortcuts</span>
                </button>
              </div>

              <div className="dropdown-divider"></div>

              <div className="dropdown-section">
                <button 
                  className="dropdown-item sign-out"
                  onClick={() => { onSignOut(); setShowUserMenu(false); }}
                >
                  <span className="item-icon">🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
