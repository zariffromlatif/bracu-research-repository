# BRACU Research Paper Repository

A comprehensive digital platform for storing, managing, and discovering research papers authored by BRAC University faculty members and students.

## 🎯 Project Overview

The Research Paper Repository for BRAC University is a centralized digital platform designed to store, manage, and search research papers. It provides a structured and efficient way to submit, approve, and share research outputs while ensuring high data integrity, quick retrieval, and effective categorization.

### Key Features

- **Paper Submission**: Comprehensive form with supervisor/co-supervisor fields and dynamic categories
- **Advanced Search**: Search by title, author, department, research category, or publication year
- **Dynamic Categories**: User-created research categories (AI, Machine Learning, Cybersecurity, etc.)
- **Approval Workflow**: Admin approval system for quality control
- **Author Management**: Direct name input for corresponding authors and co-authors
- **Academic Structure**: Authentic BRAC University departments and schools
- **File Upload**: Secure PDF upload and download system (10MB limit)
- **Real-time Statistics**: Dynamic statistics from database
- **Profile Management**: User profile viewing and editing
- **Authentication**: JWT-based authentication with role-based access control
- **Responsive Design**: Mobile-friendly interface with Bootstrap 5

## 🏗️ Architecture

- **Backend**: Node.js with Express.js
- **Database**: MySQL (bracu_repo)
- **Frontend**: React.js with Bootstrap 5
- **File Storage**: Local file system (configurable for cloud storage)
- **Authentication**: JWT tokens with bcrypt password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (XAMPP/WAMP/LAMP)
- npm or yarn package manager

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

**For Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
setup.bat
```

### Option 2: Manual Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd BracuLabRepo_Project
```

#### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

#### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bracu_repo
DB_PORT=3306
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:3000
```

#### 4. Database Setup

1. Start your MySQL server (XAMPP/WAMP/LAMP)
2. Create a database named `bracu_repo`
3. Import the database schema:
   ```bash
   mysql -u root -p bracu_repo < database_schema.sql
   ```

#### 5. Build Frontend

```bash
cd client
npm run build
cd ..
```

#### 6. Start the Application

**Development Mode:**
```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Start frontend (optional for development)
npm run client
```

**Production Mode:**
```bash
npm start
```


## 🎨 Features by User Role

### Public Users (No Login Required)
- ✅ View all approved research papers
- ✅ Search and filter papers
- ✅ Download paper files
- ✅ Browse by department/faculty

### Authors (Login Required)
- ✅ Submit new research papers
- ✅ Edit their own papers
- ✅ View submission status
- ✅ Manage paper versions
- ✅ Upload PDF files

### Admins (Login Required)
- ✅ Approve/reject paper submissions
- ✅ View all papers (including pending)
- ✅ Add admin notes to decisions
- ✅ Access admin panel
- ✅ Manage user accounts

## 🔧 API Endpoints

### Public Endpoints (No Auth)
- `GET /api/papers` - Get approved papers
- `GET /api/papers/:id` - Get specific approved paper
- `GET /api/search` - Search approved papers with category filtering
- `GET /api/departments` - Get BRAC University departments
- `GET /api/faculties` - Get BRAC University schools
- `GET /api/categories` - Get dynamic research categories
- `GET /api/stats` - Get real-time dashboard statistics

### Protected Endpoints (Auth Required)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/papers` - Submit new paper with supervisor fields (Author/Admin)
- `PUT /api/papers/:id` - Update paper (Author/Admin)
- `DELETE /api/papers/:id` - Delete paper (Author/Admin)

### Admin Only Endpoints
- `GET /api/admin/papers` - Get all papers (including pending)
- `PUT /api/admin/papers/:id/status` - Approve/reject paper
- `GET /api/admin/pending-count` - Get pending papers count

## 🗄️ Database Schema

The application uses the following main tables:
- `users` - User accounts with roles (admin/author)
- `papers` - Research paper information with supervisor fields and dynamic categories
- `departments` - BRAC University departments (8 authentic departments)
- `faculties` - BRAC University schools (6 schools)
- `co_authors` - Co-author relationships with names
- `paper_versions` - Version history tracking

### BRAC University Structure
- **8 Departments**: Architecture, CSE, ESS, EEE, ENH, Law, MNS, Pharmacy
- **6 Schools**: Architecture & Design, Data & Sciences, Humanities & Social Sciences, Engineering, Law, Pharmacy

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Role-Based Access**: Different permissions for different user roles
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for security
- **File Upload Security**: PDF-only uploads with size limits
- **Helmet.js**: Security headers protection

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices
- All modern browsers

## 🚀 Deployment & Hosting

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```


### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-secure-password
DB_NAME=bracu_repo
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://your-domain.com
```

## 🛠️ Customization

### Adding New Fields
1. Update database schema
2. Modify backend API
3. Update frontend forms
4. Adjust validation rules

### Styling Changes
- Modify `client/src/index.css` for global styles
- Update component-specific CSS
- Customize Bootstrap variables

### New Features
- Add new API endpoints
- Create new React components
- Update routing configuration
- Modify database schema as needed

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database `bracu_repo` exists
   - Import `database_schema.sql`

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes on port 5000

3. **Frontend Build Errors**
   - Clear `node_modules` and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **File Upload Issues**
   - Check file size limits (10MB max)
   - Verify upload directory permissions
   - Ensure PDF file type validation
   - Check multer configuration

5. **Authentication Errors**
   - Check JWT_SECRET in `.env`
   - Verify token expiration
   - Check user role permissions

## 📊 Project Status

- ✅ **Backend API**: Complete with 19 endpoints and authentication
- ✅ **Frontend UI**: Complete responsive React.js interface
- ✅ **Database Schema**: Complete with BRAC University structure
- ✅ **File Upload**: Secure PDF validation and storage
- ✅ **Authentication**: JWT-based with role-based access control
- ✅ **Dynamic Features**: Real-time statistics and user-created categories
- ✅ **Academic Integration**: Supervisor fields and authentic department structure
- ✅ **Error Handling**: Comprehensive error pages and user feedback
- ✅ **Performance**: Optimized build with compression and security headers
- ✅ **Documentation**: Complete setup, deployment, and API guides
- ✅ **Production Ready**: Fully tested and optimized for deployment

## 📞 Support

For technical support or questions:
- Email: zarif.latif.biz@gmail.com

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- BRAC University for the project requirements
- Open source community for the technologies used
- Contributors and developers involved in the project

## 🐙 GitHub Hosting Guide

### Quick GitHub + Vercel Deployment

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit: BRACU Research Repository"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bracu-research-repository.git
git push -u origin main
```

2. **Deploy Frontend (Vercel)**:
   - Go to [vercel.com](https://vercel.com)
   - Import from GitHub
   - Select your repository
   - Auto-deploys on every push

3. **Setup Database (PlanetScale)**:
   - Go to [planetscale.com](https://planetscale.com)
   - Create database: `bracu-research-repo`
   - Import `database_schema.sql`
   - Get connection string

4. **Configure Environment**:
   - Add environment variables in Vercel
   - Update database connection
   - Deploy and test

### Repository Structure
```
bracu-research-repository/
├── client/                 # React.js frontend
├── uploads/               # PDF file storage
├── server.js              # Express.js backend
├── database_schema.sql    # MySQL database setup
├── package.json           # Backend dependencies
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

---

