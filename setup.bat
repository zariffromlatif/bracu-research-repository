@echo off
REM BRACU Research Repository Setup Script for Windows
REM This script helps set up the project for development and production

echo 🚀 Setting up BRACU Research Repository...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [SUCCESS] Node.js is installed
)

REM Check if MySQL is available
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MySQL is not installed. Please install MySQL or use XAMPP/WAMP/LAMP
    echo [WARNING] You can download XAMPP from: https://www.apachefriends.org/
) else (
    echo [SUCCESS] MySQL is installed
)

echo.
echo [INFO] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
) else (
    echo [SUCCESS] Backend dependencies installed successfully
)

echo.
echo [INFO] Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
) else (
    echo [SUCCESS] Frontend dependencies installed successfully
)
cd ..

REM Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file...
    (
        echo # BRACU Research Repository Environment Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=bracu_repo
        echo DB_PORT=3306
        echo.
        echo # JWT Secret Key ^(CHANGE THIS IN PRODUCTION!^)
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-%RANDOM%
        echo.
        echo # File Upload Configuration
        echo UPLOAD_PATH=./uploads
        echo MAX_FILE_SIZE=10485760
        echo ALLOWED_FILE_TYPES=pdf
        echo.
        echo # CORS Configuration
        echo CORS_ORIGIN=http://localhost:3000
        echo.
        echo # Email Configuration ^(Optional^)
        echo SMTP_HOST=smtp.gmail.com
        echo SMTP_PORT=587
        echo SMTP_USER=your-email@gmail.com
        echo SMTP_PASS=your-app-password
        echo.
        echo # Security Configuration
        echo BCRYPT_ROUNDS=10
        echo TOKEN_EXPIRY=24h
    ) > .env
    echo [SUCCESS] .env file created successfully
    echo [WARNING] Please update the database credentials in .env file
) else (
    echo [WARNING] .env file already exists, skipping creation
)

REM Create uploads directory
if not exist uploads (
    echo [INFO] Creating uploads directory...
    mkdir uploads
    echo [SUCCESS] Uploads directory created
) else (
    echo [WARNING] Uploads directory already exists
)

echo.
echo [INFO] Building frontend for production...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
) else (
    echo [SUCCESS] Frontend built successfully
)
cd ..

echo.
echo [SUCCESS] Setup completed successfully!
echo.
echo Next steps:
echo 1. Set up your MySQL database:
echo    - Start your MySQL server ^(XAMPP/WAMP/LAMP^)
echo    - Create a database named 'bracu_repo'
echo    - Import the database_schema.sql file
echo.
echo 2. Update .env file with your database credentials
echo.
echo 3. Start the development server:
echo    npm run dev
echo.
echo 4. In another terminal, start the frontend:
echo    npm run client
echo.
echo 5. Open http://localhost:3000 in your browser
echo.
echo Default login credentials:
echo Admin: admin@bracu.ac.bd / admin123
echo Author: author@bracu.ac.bd / author123
echo.
pause
