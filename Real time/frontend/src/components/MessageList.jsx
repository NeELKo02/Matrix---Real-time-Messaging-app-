import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const shouldGroupMessage = (currentMsg, prevMsg) => {
    if (!prevMsg) return false;
    
    // Group if same user and within 5 minutes
    const timeDiff = Math.abs(currentMsg.timestamp - prevMsg.timestamp);
    return currentMsg.username === prevMsg.username && timeDiff < 5 * 60;
  };

  // Enhanced timestamp formatting
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getDeliveryStatus = (msg, isOwnMessage) => {
    if (!isOwnMessage) return null;
    
    return (
      <span className="delivery-status">
        <span className="checkmark">✓✓</span>
      </span>
    );
  };

  // Generate avatar color based on username
  const getAvatarColor = (username) => {
    const colors = [
      '#e01e5a', '#2eb886', '#1264a3', '#ecb22e', '#f2a341',
      '#611f69', '#4a154b', '#350d36', '#1d1c1d', '#616061'
    ];
    const hash = username.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Empty state when no messages
  if (messages.length === 0) {
    return (
      <div className="messages-container">
        <div className="empty-state">
          <div className="empty-icon">🔮</div>
          <div className="empty-title">Welcome to the Matrix</div>
          <div className="empty-subtitle">Enter the communication network. Send your first message! ⚡</div>
        </div>
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-list">
        {messages.map((message, index) => {
          if (message.type === 'system') {
            return (
              <div key={message.id} className="system-message-wrapper">
                <div className="system-message">
                  <span className="system-text">{message.message}</span>
                  <span className="system-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            );
          }

          const prevMsg = index > 0 ? messages[index - 1] : null;
          const isOwnMessage = message.user_id === currentUserId;
          const isGrouped = shouldGroupMessage(message, prevMsg);
          const avatarColor = getAvatarColor(message.username);
          
          return (
            <div 
              key={message.id} 
              className={`message-group ${isOwnMessage ? 'own-message' : 'other-message'} ${isGrouped ? 'grouped' : ''}`}
            >
              {/* Avatar - only show for other messages and when not grouped */}
              {!isOwnMessage && !isGrouped && (
                <div className="message-avatar">
                  <div 
                    className="avatar-circle"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {message.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className="message-content-wrapper">
                {/* Sender name and timestamp - only show when not grouped */}
                {!isGrouped && (
                  <div className="message-header">
                    <span className="sender-name">{message.username}</span>
                    <span className="message-timestamp">{formatTime(message.timestamp)}</span>
                  </div>
                )}
                
                {/* Message bubble */}
                <div className={`message-bubble ${isOwnMessage ? 'own-bubble' : 'other-bubble'}`}>
                  <div className="message-text">{message.message}</div>
                  {getDeliveryStatus(message, isOwnMessage)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
