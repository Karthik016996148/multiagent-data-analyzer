@echo off
echo ============================================
echo   DataFlow AI - Multi-Agent Data Analyzer
echo ============================================
echo.

if not exist ".env" (
    echo [!] No .env file found. Copying from .env.example...
    copy .env.example .env
    echo [!] Please edit .env and add your OPENAI_API_KEY
    echo.
    pause
    exit /b 1
)

echo [1/2] Starting backend server...
start "DataFlow Backend" cmd /k "cd backend && pip install -r requirements.txt -q && python server.py"

echo [2/2] Starting frontend dev server...
timeout /t 3 /nobreak > nul
start "DataFlow Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Both servers starting...
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
echo Press any key to exit this window.
pause > nul
