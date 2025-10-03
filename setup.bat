@echo off
REM Matrix Communication Platform - Setup Script

echo 🔮 Matrix Communication Platform Setup
echo ======================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

echo ✅ Python and Node.js are installed

REM Setup Backend
echo 📦 Setting up backend...
cd backend

REM Create virtual environment
python -m venv .venv
call .venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt

REM Copy environment file
if not exist .env (
    copy env.example .env
    echo 📝 Created .env file. Please edit it with your Firebase credentials.
)

cd ..

REM Setup Frontend
echo 📦 Setting up frontend...
cd frontend

REM Install dependencies
npm install

REM Copy environment file
if not exist .env (
    copy env.example .env
    echo 📝 Created .env file. Please edit it with your Firebase configuration.
)

cd ..

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit backend\.env with your Firebase credentials
echo 2. Edit frontend\.env with your Firebase configuration
echo 3. Run: scripts\start-dev.bat
echo.
echo 🔮 Welcome to the Matrix!
pause
