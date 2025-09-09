#!/bin/bash

# BRACU Research Repository Setup Script
# This script helps set up the project for development and production

echo "🚀 Setting up BRACU Research Repository..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MySQL is installed
check_mysql() {
    if command -v mysql &> /dev/null; then
        print_success "MySQL is installed"
    else
        print_warning "MySQL is not installed. Please install MySQL or use XAMPP/WAMP/LAMP"
        print_warning "You can download XAMPP from: https://www.apachefriends.org/"
    fi
}

# Install backend dependencies
install_backend() {
    print_status "Installing backend dependencies..."
    if npm install; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
}

# Install frontend dependencies
install_frontend() {
    print_status "Installing frontend dependencies..."
    cd client
    if npm install; then
        print_success "Frontend dependencies installed successfully"
        cd ..
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
}

# Create .env file
create_env() {
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
# BRACU Research Repository Environment Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bracu_repo
DB_PORT=3306

# JWT Secret Key (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security Configuration
BCRYPT_ROUNDS=10
TOKEN_EXPIRY=24h
EOF
        print_success ".env file created successfully"
        print_warning "Please update the database credentials in .env file"
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Create uploads directory
create_uploads_dir() {
    if [ ! -d "uploads" ]; then
        print_status "Creating uploads directory..."
        mkdir -p uploads
        print_success "Uploads directory created"
    else
        print_warning "Uploads directory already exists"
    fi
}

# Database setup instructions
database_setup() {
    print_status "Database setup instructions:"
    echo ""
    echo "1. Start your MySQL server (XAMPP/WAMP/LAMP)"
    echo "2. Create a database named 'bracu_repo'"
    echo "3. Import the database schema:"
    echo "   mysql -u root -p bracu_repo < database_schema.sql"
    echo ""
    echo "   Or use phpMyAdmin:"
    echo "   - Open phpMyAdmin"
    echo "   - Create database 'bracu_repo'"
    echo "   - Import database_schema.sql file"
    echo ""
    echo "4. Update database credentials in .env file if needed"
    echo ""
}

# Build frontend
build_frontend() {
    print_status "Building frontend for production..."
    cd client
    if npm run build; then
        print_success "Frontend built successfully"
        cd ..
    else
        print_error "Failed to build frontend"
        exit 1
    fi
}

# Main setup function
main() {
    echo "=========================================="
    echo "  BRACU Research Repository Setup"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_node
    check_mysql
    echo ""
    
    # Install dependencies
    install_backend
    install_frontend
    echo ""
    
    # Create necessary files and directories
    create_env
    create_uploads_dir
    echo ""
    
    # Database setup instructions
    database_setup
    
    # Build frontend
    build_frontend
    echo ""
    
    print_success "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Set up your MySQL database (see instructions above)"
    echo "2. Update .env file with your database credentials"
    echo "3. Start the development server:"
    echo "   npm run dev"
    echo ""
    echo "4. In another terminal, start the frontend:"
    echo "   npm run client"
    echo ""
    echo "5. Open http://localhost:3000 in your browser"
    echo ""
    echo "Default login credentials:"
    echo "Admin: admin@bracu.ac.bd / admin123"
    echo "Author: author@bracu.ac.bd / author123"
    echo ""
}

# Run main function
main
