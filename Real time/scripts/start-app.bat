@echo off
echo Starting Realtime Chat Application...

echo.
echo Starting Backend Server...
start cmd /k "cd /d C:\Users\neelk\Desktop\Real time\backend && .venv\Scripts\activate && python run.py"

echo.
echo Starting Frontend Server...
start cmd /k "cd /d C:\Users\neelk\Desktop\Real time\frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Once started, open your browser to: http://localhost:3001
echo.
pause
