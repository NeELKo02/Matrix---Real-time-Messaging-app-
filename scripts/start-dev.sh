#!/bin/bash

echo "🚀 Starting Realtime Chat - Development Mode"
echo

echo "📁 Setting up Backend..."
cd backend

echo "🐍 Creating Python virtual environment..."
python3 -m venv .venv
if [ $? -ne 0 ]; then
    echo "❌ Failed to create virtual environment"
    exit 1
fi

echo "🔧 Activating virtual environment..."
source .venv/bin/activate

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "🌐 Starting Flask backend server..."
DEV_MODE=1 python run.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

cd ..
echo

echo "📁 Setting up Frontend..."
cd frontend

echo "📦 Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "🌐 Starting React frontend server..."
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

cd ..
echo

echo "✅ Both servers are running!"
echo "🔗 Backend: http://localhost:5000"
echo "🔗 Frontend: http://localhost:5173"
echo
echo "💡 Open two browser tabs at http://localhost:5173 to test!"
echo
echo "Press Ctrl+C to stop both servers"

# Cleanup function
cleanup() {
    echo
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "👋 Servers stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for user input
wait
