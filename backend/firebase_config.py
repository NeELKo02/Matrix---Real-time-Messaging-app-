"""
Firebase Configuration and Initialization
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore
from google.cloud import firestore as firestore_client

class FirebaseConfig:
    """Firebase configuration and service initialization"""
    
    def __init__(self):
        self.app = None
        self.db = None
        self.auth_client = None
        self._initialized = False
    
    def initialize(self):
        """Initialize Firebase services"""
        if self._initialized:
            return
        
        try:
            # Initialize Firebase Admin SDK
            if os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY'):
                # Use service account key from environment variable
                service_account_info = json.loads(os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY'))
                cred = credentials.Certificate(service_account_info)
            elif os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
                # Use service account key file path
                cred = credentials.Certificate(os.getenv('GOOGLE_APPLICATION_CREDENTIALS'))
            else:
                # For development, use mock credentials
                print("WARNING: No Firebase credentials found - using mock mode for development")
                self._initialize_mock_mode()
                return
            
            # Initialize Firebase app
            self.app = firebase_admin.initialize_app(cred, {
                'projectId': os.getenv('FIREBASE_PROJECT_ID', 'realtime-chat-dev'),
            })
            
            # Initialize Firestore
            self.db = firestore.client()
            
            # Initialize Auth
            self.auth_client = auth
            
            self._initialized = True
            print("SUCCESS: Firebase initialized successfully")
            
        except Exception as e:
            print(f"ERROR: Firebase initialization failed: {e}")
            print("INFO: Falling back to mock mode for development")
            self._initialize_mock_mode()
    
    def _initialize_mock_mode(self):
        """Initialize mock Firebase for development"""
        self.db = MockFirestore()
        self.auth_client = MockAuth()
        self._initialized = True
        print("INFO: Firebase mock mode initialized")
    
    def verify_token(self, token):
        """Verify Firebase ID token"""
        if not self._initialized:
            self.initialize()
        
        # Handle dev tokens first
        if token and token.startswith('dev-token-'):
            username = token.replace('dev-token-', '')
            return {
                'uid': f'dev-user-{username}',
                'email': f'{username}@dev.local',
                'name': username,
                'picture': 'https://via.placeholder.com/40'
            }
        
        # Handle real Firebase tokens
        if isinstance(self.auth_client, MockAuth):
            return self.auth_client.verify_id_token(token)
        
        try:
            decoded_token = self.auth_client.verify_id_token(token)
            return {
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email'),
                'name': decoded_token.get('name'),
                'picture': decoded_token.get('picture')
            }
        except Exception as e:
            print(f"ERROR: Token verification failed: {e}")
            return None
    
    def get_firestore(self):
        """Get Firestore client"""
        if not self._initialized:
            self.initialize()
        return self.db


class MockAuth:
    """Mock Firebase Auth for development"""
    
    def verify_id_token(self, token):
        """Mock token verification"""
        if token.startswith('dev-token-'):
            username = token.replace('dev-token-', '')
            return {
                'uid': f'dev-user-{username}',
                'email': f'{username}@dev.local',
                'name': username,
                'picture': None
            }
        raise Exception("Invalid dev token")


class MockFirestore:
    """Mock Firestore for development"""
    
    def __init__(self):
        self._collections = {}
    
    def collection(self, name):
        if name not in self._collections:
            self._collections[name] = MockCollection(name)
        return self._collections[name]


class MockCollection:
    """Mock Firestore collection"""
    
    def __init__(self, name):
        self.name = name
        self._documents = {}
    
    def document(self, doc_id=None):
        if doc_id is None:
            doc_id = f"doc_{len(self._documents)}"
        return MockDocument(self, doc_id)
    
    def add(self, data):
        doc_id = f"doc_{len(self._documents)}"
        doc = MockDocument(self, doc_id)
        doc.set(data)
        return doc
    
    def where(self, field, op, value):
        return MockQuery(self, field, op, value)
    
    def order_by(self, field, direction=None):
        return MockQuery(self, order_field=field, order_direction=direction)
    
    def limit(self, count):
        return MockQuery(self, limit_count=count)


class MockDocument:
    """Mock Firestore document"""
    
    def __init__(self, collection, doc_id):
        self.collection = collection
        self.id = doc_id
        self._data = {}
    
    def set(self, data):
        self.collection._documents[self.id] = data.copy()
        print(f"Mock Firestore: Set document {self.id} in {self.collection.name}")
    
    def get(self):
        return MockDocumentSnapshot(self.id, self.collection._documents.get(self.id))
    
    def to_dict(self):
        return self.collection._documents.get(self.id, {})


class MockDocumentSnapshot:
    """Mock Firestore document snapshot"""
    
    def __init__(self, doc_id, data):
        self.id = doc_id
        self._data = data or {}
    
    def exists(self):
        return self._data is not None
    
    def to_dict(self):
        return self._data.copy() if self._data else {}


class MockQuery:
    """Mock Firestore query"""
    
    def __init__(self, collection, field=None, op=None, value=None, 
                 order_field=None, order_direction=None, limit_count=None):
        self.collection = collection
        self.field = field
        self.op = op
        self.value = value
        self.order_field = order_field
        self.order_direction = order_direction
        self.limit_count = limit_count
    
    def where(self, field, op, value):
        return MockQuery(self.collection, field, op, value, 
                        self.order_field, self.order_direction, self.limit_count)
    
    def order_by(self, field, direction=None):
        return MockQuery(self.collection, self.field, self.op, self.value,
                        field, direction, self.limit_count)
    
    def limit(self, count):
        return MockQuery(self.collection, self.field, self.op, self.value,
                        self.order_field, self.order_direction, count)
    
    def stream(self):
        # Return mock documents for development
        docs = []
        for doc_id, data in list(self.collection._documents.items())[:self.limit_count or 10]:
            docs.append(MockDocumentSnapshot(doc_id, data))
        return docs


# Global Firebase instance
firebase_config = FirebaseConfig()
