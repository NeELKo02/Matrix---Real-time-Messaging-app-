import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const generateDevUserId = () => {
  const randomNum = Math.floor(Math.random() * 1000);
  return `dev-user-${randomNum.toString().padStart(3, '0')}`;
};

export const useSocket = (authData) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [roomInfo, setRoomInfo] = useState({ room: null, users: [] });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [dmList, setDmList] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  
  const socketRef = useRef(null);

  useEffect(() => {
    if (!authData?.user || !authData?.token) return;

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: authData.token,
        username: authData.user.displayName || authData.user.email,
        userId: authData.user.uid
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setCurrentUserId(newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connected', (data) => {
      console.log('Authentication successful:', data);
      setCurrentUserId(data.user_id || newSocket.id);
      newSocket.emit('join_thread', { room: 'general' });
      newSocket.emit('get_dm_list');
      newSocket.emit('get_online_users');
    });

    newSocket.on('joined_thread', (data) => {
      console.log('Joined thread:', data);
      setMessages(data.recent_messages || []);
      setRoomInfo({ room: data.room, users: [] });
      setCurrentRoom(data.room);
      newSocket.emit('get_room_info');
    });

    newSocket.on('room_messages', (data) => {
      console.log('Received room messages:', data);
      setMessages(data.messages || []);
      setCurrentRoom(data.room);
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_joined', (data) => {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        type: 'system',
        message: data.message,
        timestamp: Date.now() / 1000
      }]);
      newSocket.emit('get_room_info');
    });

    newSocket.on('user_left', (data) => {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        type: 'system',
        message: data.message,
        timestamp: Date.now() / 1000
      }]);
      newSocket.emit('get_room_info');
    });

    newSocket.on('typing_update', (data) => {
      setTypingUsers(data.typing_users || []);
    });

    newSocket.on('room_info', (data) => {
      setRoomInfo(data);
    });

    // DM event handlers
    newSocket.on('dm_created', (data) => {
      console.log('DM created:', data);
      // Refresh DM list
      newSocket.emit('get_dm_list');
    });

    newSocket.on('dm_invitation', (data) => {
      console.log('DM invitation received:', data);
      // Show notification or update UI
      // Refresh DM list
      newSocket.emit('get_dm_list');
    });

    newSocket.on('dm_list', (data) => {
      console.log('DM list received:', data);
      setDmList(data.dms || []);
    });

    newSocket.on('online_users', (data) => {
      console.log('Online users received:', data);
      setOnlineUsers(data.users || []);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      // You could add a toast notification here
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [authData]);

  // Socket action functions
  const sendMessage = (messageText) => {
    if (!socket || !connected || !messageText.trim()) return;
    socket.emit('send_message', { message: messageText });
  };

  const sendTyping = (isTyping) => {
    if (!socket || !connected) return;
    socket.emit('typing', { typing: isTyping });
  };

  const getRoomInfo = () => {
    if (!socket || !connected) return;
    socket.emit('get_room_info');
  };

  const joinRoom = (room) => {
    if (!socket || !connected) return;
    socket.emit('join_thread', { room });
  };

  const createDM = (targetUserId) => {
    if (!socket || !connected) return;
    socket.emit('create_dm', { target_user_id: targetUserId });
  };

  const joinDM = (dmRoomId) => {
    if (!socket || !connected) return;
    socket.emit('join_dm', { dm_room_id: dmRoomId });
  };

  const getDMList = () => {
    if (!socket || !connected) return;
    socket.emit('get_dm_list');
  };

  const getOnlineUsers = () => {
    if (!socket || !connected) return;
    socket.emit('get_online_users');
  };

  return {
    // State
    connected,
    messages,
    typingUsers,
    roomInfo,
    currentUserId,
    dmList,
    onlineUsers,
    currentRoom,
    
    // Actions
    sendMessage,
    sendTyping,
    getRoomInfo,
    joinRoom,
    createDM,
    joinDM,
    getDMList,
    getOnlineUsers
  };
};
