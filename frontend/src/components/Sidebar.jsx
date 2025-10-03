import React, { useState } from 'react';

const Sidebar = ({ collapsed, onToggle, user, roomInfo, connected, dmList, onlineUsers, currentRoom, onJoinRoom, onCreateDM, onJoinDM, useMatrixInterface, onToggleMatrixInterface }) => {
  const [showDMList, setShowDMList] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);

  const channels = [
    { id: 'general', name: 'general', icon: '💬', unread: 0 },
    { id: 'random', name: 'random', icon: '🎲', unread: 2 },
    { id: 'dev', name: 'dev', icon: '💻', unread: 0 },
    { id: 'design', name: 'design', icon: '🎨', unread: 5 },
  ];

  const handleChannelClick = (channelId) => {
    onJoinRoom(channelId);
  };

  const handleDMClick = (dmRoomId) => {
    onJoinDM(dmRoomId);
  };

  const handleCreateDM = (targetUserId) => {
    onCreateDM(targetUserId);
    setShowOnlineUsers(false);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Workspace Header */}
      <div className="sidebar-header">
        <div className="workspace-info">
          <div className="workspace-icon">🔮</div>
          {!collapsed && (
            <div className="workspace-details">
              <h2>Matrix</h2>
              <span className="workspace-status">
                {connected ? '🟢 Connected' : '🔴 Disconnected'}
              </span>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Profile */}
      <div className="user-profile">
        <div className="user-avatar">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} />
          ) : (
            <div className="avatar-placeholder">
              {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div className={`status-indicator ${connected ? 'online' : 'offline'}`}></div>
        </div>
        {!collapsed && (
          <div className="user-info">
            <div className="user-name">{user?.displayName || 'User'}</div>
            <div className="user-status">{connected ? 'Active' : 'Away'}</div>
          </div>
        )}
      </div>

             {/* Channels Section */}
             <div className="sidebar-section">
               <div className="section-header">
                 {!collapsed && <span className="section-title">📢 Channels</span>}
                 {!collapsed && <button className="add-button" title="Add channel">+</button>}
               </div>
        <div className="channel-list">
          {channels.map(channel => (
            <div 
              key={channel.id} 
              className={`channel-item ${currentRoom === channel.id ? 'active' : ''}`}
              onClick={() => handleChannelClick(channel.id)}
            >
              <span className="channel-icon">{channel.icon}</span>
              {!collapsed && (
                <>
                  <span className="channel-name">{channel.name}</span>
                  {channel.unread > 0 && (
                    <span className="unread-badge">{channel.unread}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

             {/* Direct Messages Section */}
             <div className="sidebar-section">
               <div className="section-header">
                 {!collapsed && <span className="section-title">💬 Direct Messages</span>}
                 {!collapsed && (
                   <button 
                     className="add-button" 
                     title="Start a DM"
                     onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                   >
                     +
                   </button>
                 )}
               </div>
        
        {/* Online Users Dropdown */}
        {showOnlineUsers && !collapsed && (
          <div className="online-users-dropdown">
            <div className="dropdown-header">
              <span>Start a conversation</span>
              <button 
                className="close-button"
                onClick={() => setShowOnlineUsers(false)}
              >
                ✕
              </button>
            </div>
            <div className="online-users-list">
              {onlineUsers.map(user => (
                <div 
                  key={user.user_id}
                  className="online-user-item"
                  onClick={() => handleCreateDM(user.user_id)}
                >
                  <div className="user-avatar-small">
                    <div className="avatar-placeholder">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="status-dot online"></div>
                  </div>
                  <span className="user-name">{user.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DM List */}
        <div className="dm-list">
          {dmList.map(dm => (
            <div 
              key={dm.dm_room_id} 
              className={`dm-item ${currentRoom === dm.dm_room_id ? 'active' : ''}`}
              onClick={() => handleDMClick(dm.dm_room_id)}
            >
              <div className="dm-avatar">
                <div className="avatar-placeholder">
                  {dm.other_user.username.charAt(0).toUpperCase()}
                </div>
                <div className={`status-indicator ${dm.other_user.online ? 'online' : 'offline'}`}></div>
              </div>
              {!collapsed && (
                <>
                  <span className="dm-name">{dm.other_user.username}</span>
                  {dm.unread_count > 0 && (
                    <span className="unread-badge">{dm.unread_count}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

             {/* Matrix Interface Toggle - Only show in DM rooms */}
             {currentRoom && currentRoom.startsWith('dm_') && (
               <div className="sidebar-section">
                 <div className="section-header">
                   {!collapsed && <span className="section-title">🔮 Interface Mode</span>}
                 </div>
                 <div className="matrix-toggle-container">
                   <button 
                     className={`matrix-toggle-button ${!useMatrixInterface ? 'active' : ''}`}
                     onClick={() => onToggleMatrixInterface(false)}
                     title="Standard DM Interface"
                   >
                     {!collapsed && <span>💬 Standard</span>}
                     {collapsed && <span>💬</span>}
                   </button>
                   <button 
                     className={`matrix-toggle-button ${useMatrixInterface ? 'active' : ''}`}
                     onClick={() => onToggleMatrixInterface(true)}
                     title="Matrix Code Rain Interface"
                   >
                     {!collapsed && <span>🌧️ Matrix</span>}
                     {collapsed && <span>🌧️</span>}
                   </button>
                 </div>
               </div>
             )}

             {/* Sidebar Footer */}
             <div className="sidebar-footer">
               <div className="footer-actions">
                 <button className="footer-button" title="Settings">
                   ⚙️
                 </button>
                 <button className="footer-button" title="Help">
                   ❓
                 </button>
                 {!collapsed && (
                   <button className="footer-button" title="More">
                     ⋯
                   </button>
                 )}
               </div>
             </div>
    </div>
  );
};

export default Sidebar;
