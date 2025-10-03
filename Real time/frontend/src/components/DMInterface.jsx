import React, { useState, useRef, useEffect } from 'react';

const DMInterface = ({ 
  messages, 
  typingUsers, 
  currentUserId, 
  connected, 
  onSendMessage, 
  onTyping,
  otherUser,
  dmRoomId 
}) => {
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Enhanced emoji categories for DM
  const emojiCategories = {
    'Love': ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '💌', '💋', '😘', '🥰'],
    'Reactions': ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '💯', '⭐', '✨'],
    'Faces': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃'],
    'Gestures': ['👋', '🤝', '👏', '🙌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕'],
    'Objects': ['🔥', '💯', '⭐', '🌟', '✨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🏅'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
    'Food': ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🍜', '🍝', '🍛', '🍣']
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  // Handle typing indicators
  const handleTyping = (typing) => {
    if (!connected) return;

    onTyping(typing);
    setIsTyping(typing);

    if (typing) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    if (!isTyping && value.trim()) {
      handleTyping(true);
    } else if (isTyping && !value.trim()) {
      handleTyping(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!connected || !message.trim()) return;

    onSendMessage(message.trim());
    setMessage('');
    handleTyping(false);
    
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
    }
    
    messageInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    } else if (e.key === 'Escape') {
      setShowEmojiPicker(false);
      messageInputRef.current?.focus();
    }
  };

  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
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

  // Format timestamp
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

  const shouldGroupMessage = (currentMsg, prevMsg) => {
    if (!prevMsg) return false;
    const timeDiff = Math.abs(currentMsg.timestamp - prevMsg.timestamp);
    return currentMsg.username === prevMsg.username && timeDiff < 5 * 60;
  };

  return (
    <div className="dm-interface">
      {/* DM Header */}
      <div className="dm-header">
        <div className="dm-user-info">
          <div className="dm-user-avatar">
            <div 
              className="dm-avatar-circle"
              style={{ backgroundColor: getAvatarColor(otherUser?.username || 'User') }}
            >
              {otherUser?.username?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className={`dm-status-indicator ${otherUser?.online ? 'online' : 'offline'}`}></div>
          </div>
          <div className="dm-user-details">
            <h2 className="dm-user-name">{otherUser?.username || 'Unknown User'}</h2>
            <p className="dm-user-status">
              {otherUser?.online ? '🟢 Online now' : '🔴 Last seen recently'}
            </p>
          </div>
        </div>
        
        <div className="dm-actions">
          <button className="dm-action-btn" title="Voice call">
            📞
          </button>
          <button className="dm-action-btn" title="Video call">
            📹
          </button>
          <button className="dm-action-btn" title="Share screen">
            🖥️
          </button>
          <button className="dm-action-btn" title="More options">
            ⋯
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="dm-messages-container">
        {messages.length === 0 ? (
          <div className="dm-empty-state">
            <div className="dm-empty-icon">💬</div>
            <div className="dm-empty-title">Start your private conversation</div>
            <div className="dm-empty-subtitle">
              Send a message to {otherUser?.username || 'this user'} to begin your private chat
            </div>
            <div className="dm-empty-hint">
              💡 This is a direct message - only you and {otherUser?.username || 'this user'} can see these messages
            </div>
          </div>
        ) : (
          <div className="dm-messages-list">
            {messages.map((message, index) => {
              if (message.type === 'system') {
                return (
                  <div key={message.id} className="dm-system-message">
                    <span className="dm-system-text">{message.message}</span>
                    <span className="dm-system-time">{formatTime(message.timestamp)}</span>
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
                  className={`dm-message-group ${isOwnMessage ? 'own-message' : 'other-message'} ${isGrouped ? 'grouped' : ''}`}
                >
                  {/* Avatar - only show for other messages and when not grouped */}
                  {!isOwnMessage && !isGrouped && (
                    <div className="dm-message-avatar">
                      <div 
                        className="dm-avatar-circle"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {message.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="dm-message-content-wrapper">
                    {/* Sender name and timestamp - only show when not grouped */}
                    {!isGrouped && (
                      <div className="dm-message-header">
                        <span className="dm-sender-name">{message.username}</span>
                        <span className="dm-message-timestamp">{formatTime(message.timestamp)}</span>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`dm-message-bubble ${isOwnMessage ? 'own-bubble' : 'other-bubble'}`}>
                      <div className="dm-message-text">{message.message}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="dm-typing-indicator">
                <div className="dm-typing-bubble">
                  <div className="dm-typing-content">
                    <span className="dm-typing-text">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                    </span>
                    <div className="dm-typing-dots">
                      <div className="dm-dot"></div>
                      <div className="dm-dot"></div>
                      <div className="dm-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="dm-input-container">
        {/* Enhanced Emoji Picker */}
        {showEmojiPicker && (
          <div className="dm-emoji-picker">
            <div className="dm-emoji-picker-header">
              <span className="dm-emoji-picker-title">Choose an emoji</span>
              <button 
                className="dm-emoji-picker-close"
                onClick={() => setShowEmojiPicker(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category} className="dm-emoji-category">
                <div className="dm-emoji-category-title">{category}</div>
                <div className="dm-emoji-grid">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="dm-emoji-button"
                      onClick={() => handleEmojiClick(emoji)}
                      type="button"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={sendMessage} className={`dm-message-input-container ${isFocused ? 'focused' : ''} ${message.trim() ? 'has-content' : ''}`}>
          {/* Left Actions */}
          <div className="dm-input-actions-left">
            <button
              type="button"
              className={`dm-action-button dm-emoji-trigger ${showEmojiPicker ? 'active' : ''}`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
              disabled={!connected}
            >
              <span className="dm-emoji-icon">😀</span>
            </button>
            
            <button
              type="button"
              className="dm-action-button dm-attachment-button"
              title="Attach file"
              disabled={!connected}
            >
              <span className="dm-attachment-icon">📎</span>
            </button>
          </div>

          {/* Message Input */}
          <div className="dm-input-field-wrapper">
            <textarea
              ref={messageInputRef}
              className="dm-message-input"
              placeholder={connected ? `Message ${otherUser?.username || 'user'}...` : "Connecting..."}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={!connected}
              rows={1}
              maxLength={2000}
            />
            
            {/* Character count */}
            {message.length > 1500 && (
              <div className="dm-character-count">
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Send Button */}
          <button 
            type="submit" 
            className={`dm-send-button ${message.trim() ? 'active' : ''}`}
            disabled={!connected || !message.trim()}
            title="Send message"
          >
            <span className="dm-send-icon">➤</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default DMInterface;
