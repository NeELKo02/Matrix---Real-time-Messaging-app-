import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './AppleIcons';

const MessageInput = ({ onSendMessage, onTyping, connected }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Enhanced emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇'],
    'Objects': ['🔥', '💯', '⭐', '🌟', '✨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🏅'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
    'Food': ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🍜', '🍝', '🍛', '🍣'],
    'Travel': ['✈️', '🚀', '🚁', '🚂', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑'],
    'Weather': ['☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌪️']
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  // Handle typing indicators with improved logic
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
      }, 2000); // Reduced timeout for better UX
    }
  };

  // Enhanced message input handling
  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    if (!isTyping && value.trim()) {
      handleTyping(true);
    } else if (isTyping && !value.trim()) {
      handleTyping(false);
    }
  };

  // Send message with enhanced validation
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!connected || !message.trim()) return;

    onSendMessage(message.trim());
    setMessage('');
    handleTyping(false);
    
    // Reset textarea height
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
    }
    
    messageInputRef.current?.focus();
  };

  // Enhanced keyboard handling
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    } else if (e.key === 'Escape') {
      setShowEmojiPicker(false);
      messageInputRef.current?.focus();
    }
  };

  // Auto-resize textarea
  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker') && !event.target.closest('.emoji-trigger')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  return (
    <div className="input-container">
      {/* Enhanced Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-picker-header">
            <span className="emoji-picker-title">Choose an emoji</span>
            <button 
              className="emoji-picker-close"
              onClick={() => setShowEmojiPicker(false)}
              type="button"
            >
              ✕
            </button>
          </div>
          
          {Object.entries(emojiCategories).map(([category, emojis]) => (
            <div key={category} className="emoji-category">
              <div className="emoji-category-title">{category}</div>
              <div className="emoji-grid">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    className="emoji-button"
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

      <form onSubmit={sendMessage} className={`message-input-container ${isFocused ? 'focused' : ''} ${message.trim() ? 'has-content' : ''}`}>
        {/* Left Actions */}
        <div className="input-actions-left">
          <button
            type="button"
            className={`action-button emoji-trigger ${showEmojiPicker ? 'active' : ''}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
            disabled={!connected}
          >
            <span className="emoji-icon">😀</span>
          </button>
          
          <button
            type="button"
            className="action-button attachment-button"
            title="Attach file (coming soon)"
            disabled={!connected}
          >
            <span className="attachment-icon">📎</span>
          </button>
        </div>

        {/* Message Input */}
        <div className="input-field-wrapper">
          <textarea
            ref={messageInputRef}
            className="message-input"
            placeholder={connected ? "Type a message..." : "Connecting..."}
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
            <div className="character-count">
              {message.length}/2000
            </div>
          )}
        </div>

        {/* Send Button */}
        <button 
          type="submit" 
          className={`send-button ${message.trim() ? 'active' : ''}`}
          disabled={!connected || !message.trim()}
          title="Send message"
        >
          <SendIcon size={18} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
