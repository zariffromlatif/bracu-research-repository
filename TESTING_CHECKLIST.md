# BRACU Research Repository - Testing Checklist

## ✅ Pre-Launch Testing Checklist

### 1. Environment Setup
- [ ] `.env` file created with proper configuration
- [ ] Database `bracu_repo` created
- [ ] Database schema imported (`database_schema.sql`)
- [ ] Uploads directory created
- [ ] All dependencies installed (`npm install`)

### 2. Backend Testing
- [ ] Server starts without errors (`npm run dev`)
- [ ] Database connection successful
- [ ] API endpoints responding correctly
- [ ] Authentication working (login/register)
- [ ] File upload functionality working
- [ ] Error handling working

### 3. Frontend Testing
- [ ] Frontend builds successfully (`npm run build`)
- [ ] All components render correctly
- [ ] Navigation works properly
- [ ] Forms submit correctly
- [ ] Search functionality works
- [ ] Responsive design works on mobile/tablet

### 4. Authentication Testing
- [ ] Public users can view approved papers
- [ ] Login/register forms work
- [ ] JWT tokens are generated correctly
- [ ] Role-based access control works
- [ ] Admin panel accessible to admins only
- [ ] Authors can submit papers

### 5. File Upload Testing
- [ ] PDF files upload successfully
- [ ] Non-PDF files are rejected
- [ ] File size limits enforced (10MB)
- [ ] Uploaded files are accessible via URL
- [ ] File metadata stored in database

### 6. Database Testing
- [ ] Sample data loaded correctly
- [ ] Default users can login
- [ ] Paper submissions create database records
- [ ] Search queries work properly
- [ ] Admin approval updates status

### 7. Error Handling Testing
- [ ] 404 page displays for invalid routes
- [ ] 500 error page displays for server errors
- [ ] 401/403 pages display for unauthorized access
- [ ] Form validation errors display correctly
- [ ] Network errors handled gracefully

### 8. Security Testing
- [ ] Passwords are hashed with bcrypt
- [ ] JWT tokens expire correctly
- [ ] CORS configured properly
- [ ] Input validation prevents SQL injection
- [ ] File uploads restricted to PDFs only

### 9. Performance Testing
- [ ] Page load times acceptable
- [ ] Search results load quickly
- [ ] File downloads work efficiently
- [ ] Database queries optimized

### 10. Cross-Browser Testing
- [ ] Chrome compatibility
- [ ] Firefox compatibility
- [ ] Safari compatibility
- [ ] Edge compatibility
- [ ] Mobile browser compatibility

## 🚀 Launch Readiness

### Production Checklist
- [ ] Environment variables set for production
- [ ] Database configured for production
- [ ] File storage configured
- [ ] SSL certificate installed (if applicable)
- [ ] Domain configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup

### Default Credentials
- **Admin**: admin@bracu.ac.bd / admin123
- **Author**: author@bracu.ac.bd / author123

## 📋 Quick Start Commands

```bash
# Setup (run once)
chmod +x setup.sh
./setup.sh

# Development
npm run dev

# Production
npm start
```

## 🔧 Troubleshooting

If you encounter issues:

1. **Database Connection**: Check MySQL is running and credentials in `.env`
2. **Port Conflicts**: Change PORT in `.env` file
3. **File Upload Issues**: Check uploads directory permissions
4. **Build Errors**: Clear node_modules and reinstall dependencies
5. **Authentication Issues**: Verify JWT_SECRET in `.env`

## 📞 Support

For technical issues:
- Check the README.md for detailed setup instructions
- Review the troubleshooting section
- Check console logs for error messages
- Verify all prerequisites are installed

---

**Your BRACU Research Repository is ready for production!** 🎉
