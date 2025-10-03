import React, { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Header from './components/Header';
import DMInterface from './components/DMInterface';
import MatrixCodeRainInterface from './components/MatrixCodeRainInterface';

function App() {
  const [username, setUsername] = useState('');
  const [authData, setAuthData] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [useMatrixInterface, setUseMatrixInterface] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const { 
    user, 
    loading: authLoading, 
    signInWithGoogle, 
    signInWithDevToken, 
    signOut,
    getIdToken 
  } = useAuth();
  
  const {
    connected,
    messages,
    typingUsers,
    roomInfo,
    currentUserId,
    dmList,
    onlineUsers,
    currentRoom,
    sendMessage,
    sendTyping,
    getRoomInfo,
    joinRoom,
    createDM,
    joinDM,
    getDMList,
    getOnlineUsers
  } = useSocket(authData);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      setAuthData(result);
    } catch (error) {
      console.error('Google sign in failed:', error);
    }
  };

  const handleDevSignIn = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    try {
      const result = await signInWithDevToken(username.trim());
      setAuthData(result);
    } catch (error) {
      console.error('Dev sign in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setAuthData(null);
      setUsername('');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const generateRandomUsername = () => {
    const adjectives = ['Cool', 'Smart', 'Fast', 'Bright', 'Happy', 'Lucky', 'Swift', 'Bold'];
    const nouns = ['Coder', 'Dev', 'User', 'Ninja', 'Pro', 'Ace', 'Star', 'Hero'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 100);
    return `${randomAdj}${randomNoun}${randomNum}`;
  };

  if (!authData?.user) {
    if (authLoading) {
      return (
        <div className="app-loading">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <h1>🔮 Matrix</h1>
              <p>Initializing communication network...</p>
            </div>
        </div>
      );
    }

    return (
      <div className="app-loading">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">🔮</span>
              <h1>Matrix</h1>
            </div>
            <p className="auth-subtitle">Enter the Matrix of communication</p>
          </div>
          
          <div className="auth-content">
            <div className="auth-section">
              <button 
                onClick={handleGoogleSignIn}
                className="auth-button primary google-signin"
                disabled={authLoading}
              >
                <span className="google-icon">G</span>
                Continue with Google
              </button>
            </div>

            <div className="auth-divider">
              <span>or</span>
            </div>
            
            <div className="auth-section">
              <form onSubmit={handleDevSignIn} className="dev-signin-form">
                <input
                  type="text"
                  className="dev-input"
                  placeholder="Enter username (dev mode)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  required
                />
                
                <div className="dev-buttons">
                  <button 
                    type="submit" 
                    className="auth-button secondary"
                    disabled={!username.trim() || authLoading}
                  >
                    🧪 Dev Sign In
                  </button>
                  
                  <button 
                    type="button" 
                    className="auth-button secondary"
                    onClick={() => setUsername(generateRandomUsername())}
                    disabled={authLoading}
                  >
                    🎲 Random Name
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="auth-footer">
            <small>🔮 Matrix - Advanced communication network</small>
          </div>
        </div>
      </div>
    );
  }

  const isDMRoom = currentRoom && currentRoom.startsWith('dm_');
  
  const getOtherUser = () => {
    if (!isDMRoom || !dmList) return null;
    const dm = dmList.find(dm => dm.dm_room_id === currentRoom);
    return dm ? dm.other_user : null;
  };

  const otherUser = getOtherUser();

  return (
    <div className={`app-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={authData?.user}
        roomInfo={roomInfo}
        connected={connected}
        dmList={dmList}
        onlineUsers={onlineUsers}
        currentRoom={currentRoom}
        onJoinRoom={joinRoom}
        onCreateDM={createDM}
        onJoinDM={joinDM}
        useMatrixInterface={useMatrixInterface}
        onToggleMatrixInterface={setUseMatrixInterface}
      />

      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {isDMRoom ? (
          useMatrixInterface ? (
            <MatrixCodeRainInterface 
              messages={messages}
              typingUsers={typingUsers}
              currentUserId={currentUserId}
              connected={connected}
              onSendMessage={sendMessage}
              onTyping={sendTyping}
              otherUser={otherUser}
              dmRoomId={currentRoom}
            />
          ) : (
            <DMInterface 
              messages={messages}
              typingUsers={typingUsers}
              currentUserId={currentUserId}
              connected={connected}
              onSendMessage={sendMessage}
              onTyping={sendTyping}
              otherUser={otherUser}
              dmRoomId={currentRoom}
            />
          )
        ) : (
          <>
            <Header 
              user={authData?.user}
              roomInfo={roomInfo}
              connected={connected}
              onSignOut={handleSignOut}
              onThemeToggle={toggleTheme}
              isDark={isDark}
            />

            <ChatArea 
              messages={messages}
              typingUsers={typingUsers}
              currentUserId={currentUserId}
              connected={connected}
              onSendMessage={sendMessage}
              onTyping={sendTyping}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;