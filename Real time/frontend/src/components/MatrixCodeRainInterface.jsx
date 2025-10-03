import React, { useState, useRef, useEffect } from 'react';

const MatrixCodeRainInterface = ({ 
  messages, 
  typingUsers, 
  currentUserId, 
  connected, 
  onSendMessage, 
  onTyping,
  otherUser,
  dmRoomId 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [codeRainActive, setCodeRainActive] = useState(true);
  const [selectedCodeBlock, setSelectedCodeBlock] = useState(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Matrix characters for the code rain
  const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
  const matrixCode = [
    '01001000 01100101 01101100 01101100 01101111', // Hello
    '01001101 01100001 01110100 01110010 01101001 01111000', // Matrix
    '01000011 01101111 01101101 01101101 01110101 01101110 01101001 01100011 01100001 01110100 01101001 01101111 01101110', // Communication
    '01000100 01101001 01110010 01100101 01100011 01110100 00100000 01001101 01100101 01110011 01110011 01100001 01100111 01100101', // Direct Message
    '01001001 01101110 01110100 01100101 01110010 01100110 01100001 01100011 01100101', // Interface
    '01010000 01110010 01101001 01110110 01100001 01100011 01111001', // Privacy
    '01000101 01101110 01100011 01110010 01111001 01110000 01110100 01100101 01100100', // Encrypted
    '01010011 01100101 01100011 01110101 01110010 01100101' // Secure
  ];

  // Initialize Matrix code rain animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drops = [];
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }

    const draw = () => {
      if (!codeRainActive) return;

      // Black background with low opacity for trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the characters
      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // Reset drop to top randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [codeRainActive]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced emoji categories for Matrix theme
  const emojiCategories = {
    'Matrix': ['🔮', '⚡', '🌊', '🌀', '💫', '✨', '🌟', '⭐', '💎', '🔬', '🧬', '⚛️'],
    'Tech': ['💻', '🖥️', '📱', '⌨️', '🖱️', '💾', '💿', '📀', '🔌', '⚡', '🔋', '📡'],
    'Code': ['🔢', '📊', '📈', '📉', '🎯', '🎲', '🎮', '🎪', '🎨', '🎭', '🎪', '🎨'],
    'Cyber': ['🛡️', '🔒', '🔓', '🔑', '🗝️', '🔐', '🛠️', '⚙️', '🔧', '🔨', '⚒️', '🛡️'],
    'Faces': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇'],
    'Objects': ['🔥', '💯', '⭐', '🌟', '✨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🏅']
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
      '#00ff41', '#00cc33', '#00ff88', '#00ffaa', '#00ffcc',
      '#00ffee', '#00ddff', '#00bbff', '#0099ff', '#0077ff'
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

  // Handle code block click
  const handleCodeBlockClick = (code) => {
    setSelectedCodeBlock(code);
    // Convert binary to text for fun
    const binaryToText = (binary) => {
      return binary.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
    };
    
    const decodedMessage = binaryToText(code);
    if (decodedMessage && decodedMessage.length > 0) {
      setMessage(prev => prev + decodedMessage);
    }
  };

  return (
    <div className="matrix-code-rain-interface">
      {/* Matrix Code Rain Canvas */}
      <canvas 
        ref={canvasRef}
        className="matrix-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* Matrix Header */}
      <div className="matrix-header">
        <div className="matrix-user-info">
          <div className="matrix-user-avatar">
            <div 
              className="matrix-avatar-circle"
              style={{ backgroundColor: getAvatarColor(otherUser?.username || 'User') }}
            >
              {otherUser?.username?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className={`matrix-status-indicator ${otherUser?.online ? 'online' : 'offline'}`}></div>
          </div>
          <div className="matrix-user-details">
            <h2 className="matrix-user-name">{otherUser?.username || 'Unknown User'}</h2>
            <p className="matrix-user-status">
              {otherUser?.online ? '🟢 CONNECTED TO MATRIX' : '🔴 DISCONNECTED FROM MATRIX'}
            </p>
          </div>
        </div>
        
        <div className="matrix-actions">
          <button 
            className="matrix-action-btn" 
            onClick={() => setCodeRainActive(!codeRainActive)}
            title={codeRainActive ? 'Stop Code Rain' : 'Start Code Rain'}
          >
            {codeRainActive ? '⏸️' : '▶️'}
          </button>
          <button className="matrix-action-btn" title="Neural Link">
            🧠
          </button>
          <button className="matrix-action-btn" title="Quantum Sync">
            ⚛️
          </button>
          <button className="matrix-action-btn" title="Matrix Protocol">
            🔮
          </button>
        </div>
      </div>

      {/* Interactive Code Blocks */}
      <div className="matrix-code-blocks">
        {matrixCode.map((code, index) => (
          <div 
            key={index}
            className={`matrix-code-block ${selectedCodeBlock === code ? 'selected' : ''}`}
            onClick={() => handleCodeBlockClick(code)}
            style={{
              animationDelay: `${index * 0.5}s`,
              left: `${10 + (index * 12)}%`,
              top: `${20 + (index * 8)}%`
            }}
          >
            <div className="code-content">{code}</div>
            <div className="code-glow"></div>
          </div>
        ))}
      </div>

      {/* Messages Area */}
      <div className="matrix-messages-container">
        {messages.length === 0 ? (
          <div className="matrix-empty-state">
            <div className="matrix-empty-icon">🔮</div>
            <div className="matrix-empty-title">ENTER THE MATRIX</div>
            <div className="matrix-empty-subtitle">
              Initiate neural link with {otherUser?.username || 'target user'}
            </div>
            <div className="matrix-empty-hint">
              💡 Click code blocks to decode messages • Matrix protocol active
            </div>
          </div>
        ) : (
          <div className="matrix-messages-list">
            {messages.map((message, index) => {
              if (message.type === 'system') {
                return (
                  <div key={message.id} className="matrix-system-message">
                    <span className="matrix-system-text">{message.message}</span>
                    <span className="matrix-system-time">{formatTime(message.timestamp)}</span>
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
                  className={`matrix-message-group ${isOwnMessage ? 'own-message' : 'other-message'} ${isGrouped ? 'grouped' : ''}`}
                >
                  {/* Avatar - only show for other messages and when not grouped */}
                  {!isOwnMessage && !isGrouped && (
                    <div className="matrix-message-avatar">
                      <div 
                        className="matrix-avatar-circle"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {message.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="matrix-message-content-wrapper">
                    {/* Sender name and timestamp - only show when not grouped */}
                    {!isGrouped && (
                      <div className="matrix-message-header">
                        <span className="matrix-sender-name">{message.username}</span>
                        <span className="matrix-message-timestamp">{formatTime(message.timestamp)}</span>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`matrix-message-bubble ${isOwnMessage ? 'own-bubble' : 'other-bubble'}`}>
                      <div className="matrix-message-text">{message.message}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="matrix-typing-indicator">
                <div className="matrix-typing-bubble">
                  <div className="matrix-typing-content">
                    <span className="matrix-typing-text">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} transmitting...
                    </span>
                    <div className="matrix-typing-dots">
                      <div className="matrix-dot"></div>
                      <div className="matrix-dot"></div>
                      <div className="matrix-dot"></div>
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
      <div className="matrix-input-container">
        {/* Enhanced Emoji Picker */}
        {showEmojiPicker && (
          <div className="matrix-emoji-picker">
            <div className="matrix-emoji-picker-header">
              <span className="matrix-emoji-picker-title">Select Neural Symbol</span>
              <button 
                className="matrix-emoji-picker-close"
                onClick={() => setShowEmojiPicker(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category} className="matrix-emoji-category">
                <div className="matrix-emoji-category-title">{category}</div>
                <div className="matrix-emoji-grid">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="matrix-emoji-button"
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

        <form onSubmit={sendMessage} className={`matrix-message-input-container ${isFocused ? 'focused' : ''} ${message.trim() ? 'has-content' : ''}`}>
          {/* Left Actions */}
          <div className="matrix-input-actions-left">
            <button
              type="button"
              className={`matrix-action-button matrix-emoji-trigger ${showEmojiPicker ? 'active' : ''}`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Neural symbols"
              disabled={!connected}
            >
              <span className="matrix-emoji-icon">🔮</span>
            </button>
            
            <button
              type="button"
              className="matrix-action-button matrix-code-button"
              title="Insert code block"
              disabled={!connected}
            >
              <span className="matrix-code-icon">{'<>'}</span>
            </button>
          </div>

          {/* Message Input */}
          <div className="matrix-input-field-wrapper">
            <textarea
              ref={messageInputRef}
              className="matrix-message-input"
              placeholder={connected ? `Transmit to ${otherUser?.username || 'target'}...` : "Establishing neural link..."}
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
              <div className="matrix-character-count">
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Send Button */}
          <button 
            type="submit" 
            className={`matrix-send-button ${message.trim() ? 'active' : ''}`}
            disabled={!connected || !message.trim()}
            title="Transmit message"
          >
            <span className="matrix-send-icon">⚡</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default MatrixCodeRainInterface;
