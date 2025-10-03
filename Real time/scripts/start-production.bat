@echo off
echo Starting Matrix Communication Platform in PRODUCTION MODE...

REM Start Backend in Production Mode
start cmd /k "cd /d C:\Users\neelk\Desktop\Real time\backend && call .venv\Scripts\activate.bat && set DEV_MODE=0 && set USE_FIREBASE=1 && set DEBUG=False && python run.py"

REM Build and serve Frontend in Production Mode
start cmd /k "cd /d C:\Users\neelk\Desktop\Real time\frontend && npm run build && npx serve -s dist -l 3000"

echo.
echo Production servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Note: Frontend will be served as static files (production build)
echo.
pause