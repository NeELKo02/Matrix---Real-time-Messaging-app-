# Matrix Communication Platform

A modern, real-time communication platform built with Python (Flask) backend and React (Vite) frontend, featuring live group chat, direct messaging, Matrix Code Rain interface, and Firebase integration.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Firebase project (for authentication and database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd matrix-communication-platform
   ```

2. **Run setup script:**
   ```bash
   # Windows
   setup.bat
   
   # Unix/Linux/Mac
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure environment:**
   - Edit `backend/.env` with your Firebase credentials
   - Edit `frontend/.env` with your Firebase configuration

4. **Start the application:**
   ```bash
   # Windows
   scripts\start-dev.bat
   
   # Unix/Linux/Mac
   scripts/start-dev.sh
   ```

5. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`

## ✨ Features

### Core Communication
- Real-time messaging with WebSocket communication
- Live typing indicators
- Direct messaging for private conversations
- Group chat rooms with multiple channels
- User authentication with Firebase and dev tokens
- Message history with Firestore persistence
- User presence indicators (online/offline status)

### Matrix Interface
- Matrix Code Rain - Falling green code animation
- Interactive code blocks - Click binary code to decode messages
- Dual interface system - Switch between Standard and Matrix DM interfaces
- Matrix-themed styling with green glows and cyber aesthetics
- Neural link terminology throughout the interface

### Enhanced UI/UX
- Slack-inspired design with professional layout
- Apple-like animations and smooth transitions
- Dark/light mode toggle
- Responsive design for all screen sizes
- Enhanced emoji picker with 8+ categories per interface
- Auto-scroll to new messages
- Message grouping and timestamps

## 🛠️ Tech Stack

### Backend
- Flask - Web framework
- Flask-SocketIO - WebSocket support
- Firebase Admin SDK - Authentication and Firestore
- Flask-CORS - Cross-origin resource sharing
- eventlet - Async server for WebSocket handling
- python-dotenv - Environment variable management

### Frontend
- React 18 - UI framework
- Vite - Build tool and dev server
- Socket.IO Client - WebSocket client
- Firebase SDK - Authentication and database
- Lucide React - Modern icons
- CSS3 - Advanced styling with animations

## 📁 Project Structure

```
matrix-communication-platform/
├── backend/                    # Flask-SocketIO backend
│   ├── app.py                 # Main Flask application
│   ├── run.py                 # Application entry point
│   ├── database.py            # Firestore operations
│   ├── firebase_config.py     # Firebase configuration
│   ├── requirements.txt       # Python dependencies
│   └── env.example           # Environment variables template
├── frontend/                   # React frontend
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── index.html             # HTML template
│   ├── env.example            # Environment variables template
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── App.jsx            # Main React component
│       ├── index.css          # Global styles
│       ├── components/        # React components
│       ├── hooks/             # Custom React hooks
│       └── firebase/          # Firebase configuration
├── scripts/                   # Startup scripts
│   ├── start-dev.bat         # Development mode (Windows)
│   ├── start-dev.sh          # Development mode (Unix)
│   ├── start-production.bat  # Production mode (Windows)
│   └── start-production.sh   # Production mode (Unix)
├── setup.bat                 # Windows setup script
├── setup.sh                  # Unix setup script
├── README.md                  # This file
└── .gitignore                 # Git ignore rules
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DEV_MODE=1
USE_FIREBASE=1
GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
HOST=0.0.0.0
PORT=5000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 🚀 Production Deployment

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
# Set DEV_MODE=0 in .env
python run.py
```

## 📄 License

This project is for educational and demonstration purposes. Feel free to modify and extend for your needs.

---

**Enter the Matrix of communication. Experience the future of real-time messaging.**