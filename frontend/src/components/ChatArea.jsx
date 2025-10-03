import React, { useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

const ChatArea = ({ 
  messages, 
  typingUsers, 
  currentUserId, 
  connected, 
  onSendMessage, 
  onTyping 
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  return (
    <div className="chat-area">
      {/* Messages Container */}
      <div className="messages-container">
        <MessageList 
          messages={messages}
          currentUserId={currentUserId}
        />
        
        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="input-container">
        <MessageInput 
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          connected={connected}
        />
      </div>
    </div>
  );
};

export default ChatArea;
