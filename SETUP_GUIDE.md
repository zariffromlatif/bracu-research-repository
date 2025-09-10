# BRACU Research Repository - Setup Guide for Friends

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **XAMPP** - Download from [apachefriends.org](https://www.apachefriends.org/)
- **Git** (optional) - Download from [git-scm.com](https://git-scm.com/)

### Step 1: Install Required Software

#### Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version
3. Run the installer
4. Verify installation: Open Command Prompt and type `node --version`

#### Install XAMPP
1. Go to [apachefriends.org](https://www.apachefriends.org/)
2. Download XAMPP for Windows
3. Run the installer
4. Start XAMPP Control Panel
5. Start **Apache** and **MySQL** services

### Step 2: Set Up the Project

#### Option A: If you have the project files
1. Extract the project folder to your desired location
2. Open Command Prompt/PowerShell
3. Navigate to the project folder:
   ```bash
   cd path\to\your\project\folder
   ```

#### Option B: If you have a GitHub link
1. Open Command Prompt/PowerShell
2. Clone the repository:
   ```bash
   git clone [your-github-repo-url]
   cd [project-folder-name]
   ```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 4: Set Up Database

#### Method 1: Using phpMyAdmin (Recommended)
1. Open your web browser
2. Go to http://localhost/phpmyadmin
3. Click "New" in the left sidebar
4. Database name: `bracu_repo`
5. Click "Create"
6. Select the `bracu_repo` database
7. Click "Import" tab
8. Click "Choose File"
9. Select `mysql-setup.sql` from your project folder
10. Click "Go"

#### Method 2: Using Command Line
```bash
# Navigate to XAMPP MySQL bin directory
cd C:\xampp\mysql\bin

# Run the SQL file (replace path with your actual project path)
mysql -u root -p bracu_repo < "C:\path\to\your\project\mysql-setup.sql"
```

### Step 5: Configure Environment

Create a `.env` file in the project root:

```bash
# Create .env file
echo NODE_ENV=development > .env
echo PORT=5000 >> .env
echo DB_HOST=localhost >> .env
echo DB_USER=root >> .env
echo DB_PASSWORD= >> .env
echo DB_NAME=bracu_repo >> .env
echo DB_PORT=3306 >> .env
echo JWT_SECRET=your-super-secret-jwt-key-for-local-development-minimum-32-characters >> .env
echo MAX_FILE_SIZE=10485760 >> .env
```

### Step 6: Start the Application

#### Terminal 1 (Backend Server):
```bash
npm run dev
```

#### Terminal 2 (Frontend Server):
```bash
npm run client
```

### Step 7: Access the Website

- **Website**: http://localhost:3000
- **API**: http://localhost:5000/api

## 🔑 Default Login Credentials

- **Admin**: `admin@bracu.ac.bd` / `admin123`
- **Author**: `author@bracu.ac.bd` / `author123`

## 📋 Complete Command List

```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..

# 2. Create .env file
echo NODE_ENV=development > .env
echo PORT=5000 >> .env
echo DB_HOST=localhost >> .env
echo DB_USER=root >> .env
echo DB_PASSWORD= >> .env
echo DB_NAME=bracu_repo >> .env
echo DB_PORT=3306 >> .env
echo JWT_SECRET=your-super-secret-jwt-key-for-local-development-minimum-32-characters >> .env
echo MAX_FILE_SIZE=10485760 >> .env

# 3. Start backend (Terminal 1)
npm run dev

# 4. Start frontend (Terminal 2)
npm run client
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. "mysql command not found"
- Make sure XAMPP MySQL is running
- Use phpMyAdmin instead of command line

#### 2. "Port 3000 already in use"
- Close other applications using port 3000
- Or change the port in package.json

#### 3. "Database connection failed"
- Check if XAMPP MySQL is running
- Verify database name is `bracu_repo`
- Check .env file settings

#### 4. "npm command not found"
- Make sure Node.js is installed
- Restart Command Prompt after installing Node.js

### Getting Help:
- Check the console for error messages
- Make sure all services are running
- Verify all files are in the correct location

## ✅ Success Indicators

When everything is working correctly, you should see:
- Backend server running on port 5000
- Frontend server running on port 3000
- Website accessible at http://localhost:3000
- Department dropdown populated with BRACU departments
- Login working with default credentials

## 📞 Support

If you encounter any issues:
1. Check this guide step by step
2. Look at the console error messages
3. Make sure all prerequisites are installed
4. Contact the project developer for help

---

**Good luck setting up the BRACU Research Repository! 🎉**
