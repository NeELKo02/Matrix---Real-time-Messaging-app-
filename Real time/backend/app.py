import os
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from collections import deque
import uuid
import time

from dotenv import load_dotenv
load_dotenv()

from firebase_config import firebase_config
from database import db_service

app = Flask(__name__)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
CORS(app, origins=cors_origins)

async_mode = os.getenv('SOCKETIO_ASYNC_MODE', 'eventlet')
socketio = SocketIO(app, cors_allowed_origins=cors_origins, async_mode=async_mode)

DEV_MODE = os.getenv('DEV_MODE', '0') == '1'
USE_FIREBASE = os.getenv('USE_FIREBASE', '1') == '1'

if USE_FIREBASE:
    firebase_config.initialize()
    print("Firebase integration enabled")
else:
    print("Running in local mode without Firebase")

messages = deque(maxlen=1000)
connected_users = {}
typing_users = set()
dm_rooms = {}

DEFAULT_ROOM = "general"

@app.route('/')
def index():
    return {"status": "Flask-SocketIO server running", "room": DEFAULT_ROOM}

@app.route('/health')
def health():
    return {"status": "healthy", "connected_users": len(connected_users)}

@socketio.on('connect')
def handle_connect(auth):
    """Handle user connection and authentication"""
    if DEV_MODE:
        print(f"User connected: {request.sid}")
    
    user_data = auth if auth else {}
    
    # Firebase Authentication
    if USE_FIREBASE and user_data.get('token'):
        firebase_user = firebase_config.verify_token(user_data['token'])
        if firebase_user:
            # Authenticated Firebase user
            username = firebase_user.get('name') or firebase_user.get('email', f'User_{request.sid[:8]}')
            user_id = firebase_user['uid']
            
            # Save/update user profile in Firestore
            profile_data = {
                'uid': user_id,
                'email': firebase_user.get('email'),
                'name': firebase_user.get('name'),
                'picture': firebase_user.get('picture'),
                'last_seen': time.time()
            }
            db_service.save_user_profile(profile_data)
            
            if DEV_MODE:
                print(f"Firebase user authenticated: {username} ({user_id})")
        else:
            # Invalid Firebase token
            emit('auth_error', {'message': 'Invalid authentication token'})
            return False
    else:
        # Development mode or no Firebase token
        if user_data.get('token', '').startswith('dev-token-'):
            # Development token
            username = user_data['token'].replace('dev-token-', '')
            user_id = f'dev-user-{username}'
            if DEV_MODE:
                print(f"Dev token authenticated: {username}")
        else:
            # Fallback for no authentication
            username = user_data.get('username', f'User_{request.sid[:8]}')
            user_id = f'anonymous-{request.sid}'
            if DEV_MODE:
                print(f"👤 Anonymous user: {username}")
    
    # Store user info
    connected_users[request.sid] = {
        'username': username,
        'user_id': user_id,
        'joined_at': time.time(),
        'room': None,
        'firebase_uid': firebase_user.get('uid') if 'firebase_user' in locals() else None
    }
    
    emit('connected', {
        'message': 'Connected successfully',
        'user_id': request.sid,
        'username': username,
        'firebase_uid': user_id
    })
    
    if DEV_MODE:
        print(f"User {username} authenticated with session {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle user disconnection"""
    if request.sid in connected_users:
        username = connected_users[request.sid]['username']
        room = connected_users[request.sid].get('room')
        
        # Remove from typing users if present
        typing_users.discard(request.sid)
        
        # Notify room about user leaving
        if room:
            emit('user_left', {
                'username': username,
                'message': f'{username} left the chat'
            }, room=room)
            
            # Update typing indicators
            emit('typing_update', {
                'typing_users': [connected_users[uid]['username'] 
                               for uid in typing_users 
                               if uid in connected_users and connected_users[uid].get('room') == room]
            }, room=room)
        
        del connected_users[request.sid]
        print(f"User {username} disconnected")

@socketio.on('join_thread')
def handle_join_thread(data):
    """Handle user joining a chat room"""
    room = data.get('room', DEFAULT_ROOM)
    
    if request.sid not in connected_users:
        emit('error', {'message': 'User not authenticated'})
        return
    
    username = connected_users[request.sid]['username']
    old_room = connected_users[request.sid].get('room')
    
    # Leave old room if exists
    if old_room and old_room != room:
        leave_room(old_room)
        emit('user_left', {
            'username': username,
            'message': f'{username} left the chat'
        }, room=old_room)
    
    # Join new room
    join_room(room)
    connected_users[request.sid]['room'] = room
    
    # Get recent messages from Firestore or in-memory storage
    if USE_FIREBASE:
        room_messages = db_service.get_recent_messages(room, 50)
    else:
        # Fallback to in-memory storage
        recent_messages = list(messages)[-50:]  # Last 50 messages
        room_messages = [msg for msg in recent_messages if msg.get('room') == room]
    
    emit('joined_thread', {
        'room': room,
        'message': f'Joined {room}',
        'recent_messages': room_messages
    })
    
    # Notify others in the room
    emit('user_joined', {
        'username': username,
        'message': f'{username} joined the chat'
    }, room=room, include_self=False)
    
    print(f"User {username} joined room {room}")

@socketio.on('send_message')
def handle_send_message(data):
    """Handle sending a message to the room"""
    if request.sid not in connected_users:
        emit('error', {'message': 'User not authenticated'})
        return
    
    user_info = connected_users[request.sid]
    room = user_info.get('room')
    
    if not room:
        emit('error', {'message': 'Not in any room'})
        return
    
    message_text = data.get('message', '').strip()
    if not message_text:
        emit('error', {'message': 'Message cannot be empty'})
        return
    
    # Create message object
    message = {
        'id': str(uuid.uuid4()),
        'username': user_info['username'],
        'message': message_text,
        'room': room,
        'timestamp': time.time(),
        'user_id': request.sid,
        'firebase_uid': user_info.get('firebase_uid')
    }
    
    # Store message in Firestore and/or in-memory
    if USE_FIREBASE:
        # Save to Firestore
        saved_message = db_service.save_message(message.copy())
        message.update(saved_message)
    else:
        # Fallback to in-memory storage
        messages.append(message)
    
    # Broadcast to room
    emit('new_message', message, room=room)
    
    if DEV_MODE:
        print(f"💬 Message from {user_info['username']} in {room}: {message_text}")

@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicators"""
    if request.sid not in connected_users:
        return
    
    user_info = connected_users[request.sid]
    room = user_info.get('room')
    
    if not room:
        return
    
    is_typing = data.get('typing', False)
    
    if is_typing:
        typing_users.add(request.sid)
    else:
        typing_users.discard(request.sid)
    
    # Get typing users in the same room
    room_typing_users = [
        connected_users[uid]['username'] 
        for uid in typing_users 
        if uid in connected_users and connected_users[uid].get('room') == room
    ]
    
    # Broadcast typing update to room (excluding self)
    emit('typing_update', {
        'typing_users': room_typing_users
    }, room=room, include_self=False)

@socketio.on('get_room_info')
def handle_get_room_info():
    """Get information about current room"""
    if request.sid not in connected_users:
        emit('error', {'message': 'User not authenticated'})
        return
    
    user_info = connected_users[request.sid]
    room = user_info.get('room')
    
    if not room:
        emit('room_info', {'room': None, 'users': []})
        return
    
    # Get users in the same room
    room_users = [
        {'username': user['username'], 'user_id': uid}
        for uid, user in connected_users.items()
        if user.get('room') == room
    ]
    
    # Get room statistics
    if USE_FIREBASE:
        room_stats = db_service.get_room_stats(room)
        total_messages = room_stats['total_messages']
    else:
        total_messages = len([msg for msg in messages if msg.get('room') == room])
    
    emit('room_info', {
        'room': room,
        'users': room_users,
        'total_messages': total_messages
    })

@socketio.on('create_dm')
def handle_create_dm(data):
    """Create a direct message room between two users"""
    target_user_id = data.get('target_user_id')
    current_user_id = request.sid
    
    if not target_user_id:
        emit('error', {'message': 'Target user ID is required'})
        return
    
    if target_user_id == current_user_id:
        emit('error', {'message': 'Cannot create DM with yourself'})
        return
    
    # Create DM room ID (sorted to ensure consistency)
    dm_room_id = f"dm_{sorted([current_user_id, target_user_id])[0]}_{sorted([current_user_id, target_user_id])[1]}"
    
    # Store DM room info
    dm_rooms[dm_room_id] = {
        'participants': [current_user_id, target_user_id],
        'created_at': time.time(),
        'last_message_at': time.time()
    }
    
    # Join both users to the DM room
    join_room(dm_room_id)
    
    # Get user info
    current_user = connected_users.get(current_user_id, {})
    target_user = connected_users.get(target_user_id, {})
    
    emit('dm_created', {
        'dm_room_id': dm_room_id,
        'participants': [
            {
                'user_id': current_user_id,
                'username': current_user.get('username', 'Unknown'),
                'firebase_uid': current_user.get('firebase_uid')
            },
            {
                'user_id': target_user_id,
                'username': target_user.get('username', 'Unknown'),
                'firebase_uid': target_user.get('firebase_uid')
            }
        ]
    })
    
    # Notify the target user about the DM
    emit('dm_invitation', {
        'dm_room_id': dm_room_id,
        'from_user': {
            'user_id': current_user_id,
            'username': current_user.get('username', 'Unknown'),
            'firebase_uid': current_user.get('firebase_uid')
        }
    }, room=target_user_id)
    
    if DEV_MODE:
        print(f"DM room created: {dm_room_id} between {current_user.get('username')} and {target_user.get('username')}")

@socketio.on('join_dm')
def handle_join_dm(data):
    """Join a direct message room"""
    dm_room_id = data.get('dm_room_id')
    current_user_id = request.sid
    
    if not dm_room_id:
        emit('error', {'message': 'DM room ID is required'})
        return
    
    if dm_room_id not in dm_rooms:
        emit('error', {'message': 'DM room not found'})
        return
    
    # Check if user is a participant
    if current_user_id not in dm_rooms[dm_room_id]['participants']:
        emit('error', {'message': 'You are not a participant in this DM'})
        return
    
    # Join the DM room
    join_room(dm_room_id)
    
    # Get recent messages for this DM
    if USE_FIREBASE:
        try:
            room_messages = db_service.get_recent_messages(dm_room_id, limit=50)
            emit('room_messages', {
                'room': dm_room_id,
                'messages': room_messages
            })
        except Exception as e:
            print(f"ERROR: Error retrieving DM messages: {e}")
            emit('room_messages', {
                'room': dm_room_id,
                'messages': []
            })
    else:
        # Get messages from in-memory storage
        room_messages = [msg for msg in messages if msg.get('room') == dm_room_id]
        room_messages.sort(key=lambda x: x.get('timestamp', 0))
        
        emit('room_messages', {
            'room': dm_room_id,
            'messages': room_messages[-50:]  # Last 50 messages
        })
    
    # Update user's current room
    if current_user_id in connected_users:
        connected_users[current_user_id]['room'] = dm_room_id
    
    if DEV_MODE:
        user_info = connected_users.get(current_user_id, {})
        print(f"User {user_info.get('username', 'Unknown')} joined DM room {dm_room_id}")

@socketio.on('get_dm_list')
def handle_get_dm_list():
    """Get list of DM rooms for the current user"""
    current_user_id = request.sid
    
    # Find all DM rooms where the user is a participant
    user_dms = []
    for dm_room_id, dm_info in dm_rooms.items():
        if current_user_id in dm_info['participants']:
            # Get the other participant
            other_participant_id = [pid for pid in dm_info['participants'] if pid != current_user_id][0]
            other_user = connected_users.get(other_participant_id, {})
            
            # Count unread messages (simplified - in real app, track read status)
            if USE_FIREBASE:
                try:
                    room_stats = db_service.get_room_stats(dm_room_id)
                    unread_count = room_stats.get('total_messages', 0)
                except:
                    unread_count = 0
            else:
                room_messages = [msg for msg in messages if msg.get('room') == dm_room_id]
                unread_count = len(room_messages)
            
            user_dms.append({
                'dm_room_id': dm_room_id,
                'other_user': {
                    'user_id': other_participant_id,
                    'username': other_user.get('username', 'Unknown'),
                    'firebase_uid': other_user.get('firebase_uid'),
                    'online': other_participant_id in connected_users
                },
                'last_message_at': dm_info['last_message_at'],
                'unread_count': unread_count
            })
    
    # Sort by last message time
    user_dms.sort(key=lambda x: x['last_message_at'], reverse=True)
    
    emit('dm_list', {'dms': user_dms})
    
    if DEV_MODE:
        user_info = connected_users.get(current_user_id, {})
        print(f"Sent DM list to {user_info.get('username', 'Unknown')}: {len(user_dms)} DMs")

@socketio.on('get_online_users')
def handle_get_online_users():
    """Get list of online users for DM creation"""
    current_user_id = request.sid
    
    online_users = []
    for uid, user_info in connected_users.items():
        if uid != current_user_id:  # Exclude self
            online_users.append({
                'user_id': uid,
                'username': user_info.get('username', 'Unknown'),
                'firebase_uid': user_info.get('firebase_uid'),
                'last_seen': user_info.get('joined_at', time.time())
            })
    
    # Sort by username
    online_users.sort(key=lambda x: x['username'])
    
    emit('online_users', {'users': online_users})
    
    if DEV_MODE:
        user_info = connected_users.get(current_user_id, {})
        print(f"Sent online users list to {user_info.get('username', 'Unknown')}: {len(online_users)} users")

if __name__ == '__main__':
    print("Starting Flask-SocketIO server...")
    print(f"Default room: {DEFAULT_ROOM}")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
