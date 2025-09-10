#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 BRACU Research Repository - Local Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Local Development Environment Variables
NODE_ENV=development
PORT=5000

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/bracu_repo

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-for-local-development-minimum-32-characters

# File Upload Configuration
MAX_FILE_SIZE=10485760`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
} else {
  console.log('✅ .env file already exists');
}

// Check if PostgreSQL is running
console.log('\n🔍 Checking PostgreSQL connection...');
try {
  const { Pool } = require('pg');
  const db = new Pool({
    connectionString: 'postgresql://postgres:password@localhost:5432/bracu_repo'
  });
  
  db.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.log('❌ PostgreSQL not running or not accessible');
      console.log('\n📋 To start PostgreSQL:');
      console.log('Option 1 - Docker:');
      console.log('  docker run --name postgres-bracu -e POSTGRES_PASSWORD=password -e POSTGRES_DB=bracu_repo -p 5432:5432 -d postgres:13');
      console.log('\nOption 2 - Local Installation:');
      console.log('  Download from https://www.postgresql.org/download/');
      console.log('  Create database: createdb bracu_repo');
    } else {
      console.log('✅ PostgreSQL is running and accessible');
      console.log('✅ Connected at:', result.rows[0].now);
    }
    db.end();
  });
} catch (error) {
  console.log('❌ Error checking PostgreSQL:', error.message);
}

// Check Node.js version
console.log('\n🔍 Checking Node.js version...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log('✅ Node.js version:', nodeVersion);
  
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion < 16) {
    console.log('⚠️  Warning: Node.js 16+ recommended');
  }
} catch (error) {
  console.log('❌ Node.js not found');
}

// Check if dependencies are installed
console.log('\n🔍 Checking dependencies...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('✅ Backend dependencies installed');
} else {
  console.log('❌ Backend dependencies not installed');
  console.log('📋 Run: npm install');
}

if (fs.existsSync(path.join(__dirname, 'client', 'node_modules'))) {
  console.log('✅ Frontend dependencies installed');
} else {
  console.log('❌ Frontend dependencies not installed');
  console.log('📋 Run: cd client && npm install');
}

console.log('\n🎯 Next Steps:');
console.log('1. Make sure PostgreSQL is running');
console.log('2. Install dependencies: npm install && cd client && npm install');
console.log('3. Start backend: npm run dev');
console.log('4. Start frontend: npm run client');
console.log('5. Open http://localhost:3000');

console.log('\n🔑 Default Login Credentials:');
console.log('Admin: admin@bracu.ac.bd / admin123');
console.log('Author: author@bracu.ac.bd / author123');
