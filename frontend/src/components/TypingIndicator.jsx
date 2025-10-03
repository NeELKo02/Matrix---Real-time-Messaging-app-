import React from 'react';

const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `✍️ ${typingUsers[0]} is typing`;
    } else if (typingUsers.length === 2) {
      return `✍️ ${typingUsers[0]} and ${typingUsers[1]} are typing`;
    } else {
      return `✍️ ${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;
    }
  };

  return (
    <div className="typing-indicator">
      <div className="typing-bubble">
        <div className="typing-content">
          <span className="typing-text">{getTypingText()}</span>
          <div className="typing-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
