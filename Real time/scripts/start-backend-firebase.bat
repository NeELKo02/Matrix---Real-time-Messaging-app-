@echo off
echo 🔥 Starting Backend with Firebase...

cd backend
call .venv\Scripts\activate
set USE_FIREBASE=1
set DEV_MODE=0
python run.py

pause
