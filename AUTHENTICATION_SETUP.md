# Authentication System Setup Guide

## Overview
This project now includes a complete authentication system with the following features:
- **Public Access**: Anyone can view and download approved research papers without login
- **Author Access**: Authors must login to submit, edit, and manage their papers
- **Admin Access**: Admins can approve/reject papers and manage the system

## Setup Instructions

### 1. Database Setup
1. Start your MySQL server (XAMPP/WAMP/LAMP)
2. Run the `database_schema.sql` file in your MySQL database
3. This will create all necessary tables and sample data

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=brac_repo
DB_PORT=3306
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
```

### 3. Install Dependencies
```bash
# Backend dependencies (already installed)
npm install

# Frontend dependencies
cd client
npm install
cd ..
```

### 4. Run the Application
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
npm run client
```

## Default Users

### Admin User
- **Email**: admin@bracu.ac.bd
- **Password**: admin123
- **Role**: Admin
- **Access**: Full system access, can approve/reject papers

### Sample Author
- **Email**: author@bracu.ac.bd
- **Password**: author123
- **Role**: Author
- **Access**: Can submit and manage their own papers

## Features

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

### Admins (Login Required)
- ✅ Approve/reject paper submissions
- ✅ View all papers (including pending)
- ✅ Add admin notes to decisions
- ✅ Access admin panel

## API Endpoints

### Public Endpoints (No Auth)
- `GET /api/papers` - Get approved papers
- `GET /api/papers/:id` - Get specific approved paper
- `GET /api/search` - Search approved papers
- `GET /api/departments` - Get departments
- `GET /api/faculties` - Get faculties

### Protected Endpoints (Auth Required)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/papers` - Submit new paper (Author/Admin)
- `PUT /api/papers/:id` - Update paper (Author/Admin)
- `DELETE /api/papers/:id` - Delete paper (Author/Admin)

### Admin Only Endpoints
- `GET /api/admin/papers` - Get all papers (including pending)
- `PUT /api/admin/papers/:id/status` - Approve/reject paper
- `GET /api/admin/pending-count` - Get pending papers count

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Role-Based Access**: Different permissions for different user roles
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for security

## File Structure

```
client/src/
├── components/
│   ├── Login.js          # Login/Register component
│   ├── Admin.js          # Admin panel component
│   ├── Navigation.js     # Updated with auth features
│   └── ...
├── contexts/
│   └── AuthContext.js    # Authentication context
└── App.js                # Updated with auth routes

server.js                 # Updated with auth endpoints
database_schema.sql       # Database setup
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `.env`
   - Verify database `brac_repo` exists

2. **Authentication Errors**
   - Check JWT_SECRET in `.env`
   - Verify token expiration
   - Check user role permissions

3. **Paper Submission Issues**
   - Ensure user is logged in
   - Check if user has author/admin role
   - Verify all required fields are filled

4. **Admin Access Issues**
   - Verify user role is 'admin' in database
   - Check if admin route is properly protected
   - Ensure JWT token is valid

## Testing the System

1. **Public Access Test**
   - Visit `/papers` without login
   - Should see approved papers only

2. **Author Login Test**
   - Login with author@bracu.ac.bd / author123
   - Should see "Add Paper" option
   - Can submit new papers

3. **Admin Login Test**
   - Login with admin@bracu.ac.bd / admin123
   - Should see "Admin Panel" option
   - Can approve/reject papers

## Next Steps

- Add file upload functionality for papers
- Implement email notifications
- Add user profile management
- Create paper versioning system
- Add analytics and reporting features
