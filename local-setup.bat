@echo off
echo 🚀 BRACU Research Repository - Local Setup
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating .env file...
    echo # Local Development Environment Variables > .env
    echo NODE_ENV=development >> .env
    echo PORT=5000 >> .env
    echo. >> .env
    echo # PostgreSQL Database Configuration >> .env
    echo DATABASE_URL=postgresql://postgres:password@localhost:5432/bracu_repo >> .env
    echo. >> .env
    echo # Security Configuration >> .env
    echo JWT_SECRET=your-super-secret-jwt-key-for-local-development-minimum-32-characters >> .env
    echo. >> .env
    echo # File Upload Configuration >> .env
    echo MAX_FILE_SIZE=10485760 >> .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

REM Install backend dependencies
echo.
echo 📦 Installing backend dependencies...
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

REM Install frontend dependencies
echo.
echo 📦 Installing frontend dependencies...
cd client
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)
cd ..

echo.
echo 🎯 Setup Complete!
echo.
echo 📋 Next Steps:
echo 1. Start PostgreSQL database
echo 2. Start backend: npm run dev
echo 3. Start frontend: npm run client
echo 4. Open http://localhost:3000
echo.
echo 🔑 Default Login Credentials:
echo Admin: admin@bracu.ac.bd / admin123
echo Author: author@bracu.ac.bd / author123
echo.
pause
