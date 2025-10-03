@echo off
echo 🚀 Starting Realtime Chat - Development Mode
echo.

echo 📁 Setting up Backend...
cd backend

echo 🐍 Creating Python virtual environment...
python -m venv .venv
if errorlevel 1 (
    echo ❌ Failed to create virtual environment
    pause
    exit /b 1
)

echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat

echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo 🌐 Starting Flask backend server...
start "Backend Server" cmd /k "call .venv\Scripts\activate.bat && set DEV_MODE=1 && python run.py"

cd ..
echo.

echo 📁 Setting up Frontend...
cd frontend

echo 📦 Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo 🌐 Starting React frontend server...
start "Frontend Server" cmd /k "npm run dev"

cd ..
echo.

echo ✅ Both servers are starting...
echo 🔗 Backend: http://localhost:5000
echo 🔗 Frontend: http://localhost:5173
echo.
echo 💡 Open two browser tabs at http://localhost:5173 to test!
echo.
pause
