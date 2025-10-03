import React, { useState, useRef, useEffect } from 'react';
import { WifiIcon, WifiOffIcon, UsersIcon, MoonIcon, SunIcon } from './AppleIcons';

const ConnectionStatus = ({ connected, username, roomInfo, onThemeToggle, isDark, user, onSignOut }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getConnectionStatus = () => {
    if (connected) {
      return {
        icon: '🟢',
        text: 'Online',
        color: '#34C759'
      };
    } else {
      return {
        icon: '🔴',
        text: 'Connecting...',
        color: '#FF3B30'
      };
    }
  };

  const status = getConnectionStatus();
  const roomDisplayName = roomInfo.room === 'general' ? 'General Chat' : roomInfo.room;
  const onlineCount = roomInfo.users?.length || 0;

  return (
    <div className="chat-header">
      {/* Left Section - Room Info with Avatar */}
      <div className="header-left">
        <div className="room-avatar">
          <div className="room-icon">💬</div>
        </div>
        <div className="room-info">
          <div className="room-title">{roomDisplayName}</div>
          <div className="room-subtitle">
            <span className="connection-status" style={{ color: status.color }}>
              {status.text}
            </span>
            {connected && onlineCount > 0 && (
              <>
                <span className="separator">•</span>
                <span className="online-count">{onlineCount} members</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="header-right">
        {/* Theme Toggle */}
        <button 
          className="header-action-btn"
          onClick={onThemeToggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* User Profile Button */}
        {user && (
          <div className="user-profile-btn">
            <div className="user-avatar-small">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-placeholder">
                  {username?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className={`status-dot ${connected ? 'online' : 'offline'}`}></div>
            </div>
          </div>
        )}

        {/* Menu Dropdown */}
        <div className="menu-container" ref={menuRef}>
          <button 
            className={`menu-trigger ${showMenu ? 'active' : ''}`}
            onClick={() => setShowMenu(!showMenu)}
            title="More options"
          >
            <div className="menu-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          
          {showMenu && (
            <div className="dropdown-menu">
              <div className="menu-section">
                <div className="menu-user-card">
                  <div className="user-avatar-menu">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="user-details-menu">
                    <div className="user-name">{username}</div>
                    <div className="user-status">{connected ? 'Online' : 'Offline'}</div>
                  </div>
                </div>
              </div>
              
              <div className="menu-divider"></div>
              
              <div className="menu-section">
                <button className="menu-item" onClick={() => setShowMenu(false)}>
                  <span className="menu-icon">🔔</span>
                  <span>Notifications</span>
                </button>
                <button className="menu-item" onClick={() => setShowMenu(false)}>
                  <span className="menu-icon">🗑️</span>
                  <span>Clear Chat</span>
                </button>
                <button className="menu-item" onClick={() => setShowMenu(false)}>
                  <span className="menu-icon">ℹ️</span>
                  <span>Room Info</span>
                </button>
                <button className="menu-item" onClick={() => setShowMenu(false)}>
                  <span className="menu-icon">⚙️</span>
                  <span>Settings</span>
                </button>
              </div>
              
              <div className="menu-divider"></div>
              
              <div className="menu-section">
                <button className="menu-item danger" onClick={() => { onSignOut(); setShowMenu(false); }}>
                  <span className="menu-icon">🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
