@echo off
echo ========================================
echo BRACU Research Repository Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    echo Download the LTS version and run the installer.
    echo After installation, restart this script.
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Check if .env file exists
echo.
echo Setting up environment variables...
if not exist ".env" (
    echo Creating .env file...
    echo NODE_ENV=development > .env
    echo PORT=5000 >> .env
    echo DB_HOST=localhost >> .env
    echo DB_USER=root >> .env
    echo DB_PASSWORD= >> .env
    echo DB_NAME=bracu_repo >> .env
    echo DB_PORT=3306 >> .env
    echo JWT_SECRET=your-super-secret-jwt-key-for-local-development-minimum-32-characters >> .env
    echo MAX_FILE_SIZE=10485760 >> .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

REM Install backend dependencies
echo.
echo Installing backend dependencies...
if not exist "node_modules" (
    echo This may take a few minutes...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd client
if not exist "node_modules" (
    echo This may take a few minutes...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)
cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo 📋 Next Steps:
echo 1. Start XAMPP and run Apache + MySQL
echo 2. Go to http://localhost/phpmyadmin
echo 3. Create database: bracu_repo
echo 4. Import mysql-setup.sql file
echo 5. Run start-backend.bat (Terminal 1)
echo 6. Run start-frontend.bat (Terminal 2)
echo 7. Open http://localhost:3000
echo.
echo 🔑 Default Login Credentials:
echo Admin: admin@bracu.ac.bd / admin123
echo Author: author@bracu.ac.bd / author123
echo.
echo 📖 For detailed instructions, see SETUP_GUIDE_FOR_FRIENDS.md
echo.
pause
