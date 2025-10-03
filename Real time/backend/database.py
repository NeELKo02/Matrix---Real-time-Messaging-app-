"""
Database Service Layer for Firestore Integration
"""

import time
import uuid
from datetime import datetime
from firebase_config import firebase_config

class DatabaseService:
    """Service layer for database operations"""
    
    def __init__(self):
        self.db = firebase_config.get_firestore()
    
    # Message Operations
    def save_message(self, message_data):
        """Save a message to Firestore"""
        try:
            # Create a copy for Firestore (with datetime)
            firestore_data = message_data.copy()
            firestore_data['created_at'] = datetime.utcnow()
            firestore_data['server_timestamp'] = time.time()
            
            # Save to Firestore
            doc_ref = self.db.collection('messages').add(firestore_data)
            
            # Return JSON-serializable data (no datetime objects)
            result_data = message_data.copy()
            result_data['server_timestamp'] = time.time()
            
            # Add document ID if available
            if hasattr(doc_ref, 'id'):
                result_data['firestore_id'] = doc_ref.id
            
            print(f"💾 Message saved to Firestore: {message_data.get('message', '')[:50]}...")
            return result_data
            
        except Exception as e:
            print(f"ERROR: Error saving message: {e}")
            return message_data
    
    def get_recent_messages(self, room, limit=50):
        """Get recent messages for a room"""
        try:
            messages_ref = self.db.collection('messages')
            query = messages_ref.where('room', '==', room)\
                              .order_by('server_timestamp', direction='DESCENDING')\
                              .limit(limit)
            
            messages = []
            for doc in query.stream():
                message_data = doc.to_dict()
                message_data['firestore_id'] = doc.id
                
                # Convert datetime objects to timestamps for JSON serialization
                if 'created_at' in message_data and hasattr(message_data['created_at'], 'timestamp'):
                    message_data['created_at'] = message_data['created_at'].timestamp()
                elif 'created_at' in message_data:
                    # Remove datetime if it can't be converted
                    del message_data['created_at']
                
                messages.append(message_data)
            
            # Reverse to get chronological order
            messages.reverse()
            
            print(f"📚 Retrieved {len(messages)} messages for room '{room}'")
            return messages
            
        except Exception as e:
            print(f"ERROR: Error retrieving messages: {e}")
            return []
    
    def delete_message(self, message_id):
        """Delete a message from Firestore"""
        try:
            self.db.collection('messages').document(message_id).delete()
            print(f"🗑️ Message deleted: {message_id}")
            return True
        except Exception as e:
            print(f"ERROR: Error deleting message: {e}")
            return False
    
    # User Operations
    def save_user_profile(self, user_data):
        """Save or update user profile"""
        try:
            user_id = user_data['uid']
            user_ref = self.db.collection('users').document(user_id)
            
            # Create a copy for Firestore (with datetime)
            firestore_data = user_data.copy()
            
            # Add timestamps to Firestore data
            existing_user = user_ref.get()
            if existing_user.exists():
                firestore_data['updated_at'] = datetime.utcnow()
            else:
                firestore_data['created_at'] = datetime.utcnow()
                firestore_data['updated_at'] = datetime.utcnow()
            
            # Use merge=True for real Firestore, but handle mock mode
            try:
                user_ref.set(firestore_data, merge=True)
            except TypeError:
                # Mock Firestore doesn't support merge parameter
                user_ref.set(firestore_data)
            
            print(f"👤 User profile saved: {user_data.get('name', user_id)}")
            
            # Return original data without datetime objects
            return user_data
            
        except Exception as e:
            print(f"ERROR: Error saving user profile: {e}")
            return user_data
    
    def get_user_profile(self, user_id):
        """Get user profile by ID"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists():
                return user_doc.to_dict()
            else:
                return None
                
        except Exception as e:
            print(f"ERROR: Error retrieving user profile: {e}")
            return None
    
    def get_online_users(self, room):
        """Get list of online users in a room"""
        try:
            # In a real implementation, you'd track online status
            # For now, return users who have sent messages recently
            cutoff_time = time.time() - 300  # 5 minutes ago
            
            messages_ref = self.db.collection('messages')
            query = messages_ref.where('room', '==', room)\
                              .where('server_timestamp', '>', cutoff_time)
            
            users = set()
            for doc in query.stream():
                message_data = doc.to_dict()
                users.add(message_data.get('username'))
            
            return list(users)
            
        except Exception as e:
            print(f"ERROR: Error getting online users: {e}")
            return []
    
    # Room Operations
    def create_room(self, room_data):
        """Create a new chat room"""
        try:
            room_data['created_at'] = datetime.utcnow()
            room_data['updated_at'] = datetime.utcnow()
            
            doc_ref = self.db.collection('rooms').add(room_data)
            room_data['room_id'] = doc_ref.id if hasattr(doc_ref, 'id') else room_data['name']
            
            print(f"🏠 Room created: {room_data['name']}")
            return room_data
            
        except Exception as e:
            print(f"ERROR: Error creating room: {e}")
            return room_data
    
    def get_user_rooms(self, user_id):
        """Get rooms that a user has access to"""
        try:
            # For now, return all public rooms + rooms user has joined
            rooms_ref = self.db.collection('rooms')
            
            # Get public rooms
            public_rooms = rooms_ref.where('is_public', '==', True).stream()
            
            rooms = []
            for doc in public_rooms:
                room_data = doc.to_dict()
                room_data['room_id'] = doc.id
                rooms.append(room_data)
            
            # Add default general room if not exists
            if not any(room['name'] == 'general' for room in rooms):
                rooms.insert(0, {
                    'room_id': 'general',
                    'name': 'general',
                    'description': 'General chat room',
                    'is_public': True,
                    'created_at': datetime.utcnow()
                })
            
            return rooms
            
        except Exception as e:
            print(f"ERROR: Error getting user rooms: {e}")
            return [{'room_id': 'general', 'name': 'general', 'is_public': True}]
    
    # Analytics and Stats
    def get_room_stats(self, room):
        """Get statistics for a room"""
        try:
            messages_ref = self.db.collection('messages')
            
            # Count total messages
            total_messages = len(list(messages_ref.where('room', '==', room).stream()))
            
            # Count unique users (last 24 hours)
            day_ago = time.time() - 86400
            recent_messages = messages_ref.where('room', '==', room)\
                                        .where('server_timestamp', '>', day_ago)\
                                        .stream()
            
            unique_users = set()
            for doc in recent_messages:
                message_data = doc.to_dict()
                unique_users.add(message_data.get('user_id'))
            
            return {
                'total_messages': total_messages,
                'active_users_24h': len(unique_users),
                'room': room
            }
            
        except Exception as e:
            print(f"ERROR: Error getting room stats: {e}")
            return {'total_messages': 0, 'active_users_24h': 0, 'room': room}


# Global database service instance
db_service = DatabaseService()
