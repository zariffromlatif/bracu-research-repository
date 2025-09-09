# 🚀 GitHub Hosting Guide for BRACU Research Repository

## 📋 Complete Step-by-Step Guide

### 🎯 What We'll Achieve:
- **GitHub Repository**: Store your code
- **Free Hosting**: Deploy frontend and backend
- **Live Database**: MySQL database in the cloud
- **Custom Domain**: Professional URL (optional)
- **Auto-Deploy**: Updates automatically when you push code

---

## 📝 **STEP 1: Prepare Your Project for GitHub**

### A. Create .env.example File
Create a file called `.env.example` in your project root with this content:

```env
# BRACU Research Repository - Environment Template
# Copy this to .env and update values

PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bracu_repo
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:3000
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### B. Verify .gitignore (Already Created ✅)
Your `.gitignore` file is already set up correctly to exclude:
- `node_modules/`
- `.env` files
- `uploads/` directory
- Build files

---

## 🐙 **STEP 2: Create GitHub Repository**

### A. Go to GitHub
1. **Open** [github.com](https://github.com)
2. **Sign in** to your GitHub account
3. **Click** the green "New" button (or "+" → "New repository")

### B. Repository Settings
- **Repository name**: `bracu-research-repository`
- **Description**: `BRAC University Research Paper Repository - A comprehensive platform for managing research papers`
- **Visibility**: 
  - **Public** (recommended for academic projects)
  - **Private** (if you prefer private access)
- **Initialize**: 
  - ❌ **Don't check** "Add a README file"
  - ❌ **Don't check** "Add .gitignore"
  - ❌ **Don't check** "Choose a license"
- **Click** "Create repository"

---

## 💻 **STEP 3: Push Your Code to GitHub**

### A. Initialize Git (In Your Project Folder)
Open PowerShell in your project directory and run:

```bash
git init
```

### B. Add All Files
```bash
git add .
```

### C. Make First Commit
```bash
git commit -m "Initial commit: BRACU Research Repository with all features"
```

### D. Add GitHub Remote
Replace `YOUR_USERNAME` with your actual GitHub username:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bracu-research-repository.git
```

### E. Push to GitHub
```bash
git push -u origin main
```

**🎉 Your code is now on GitHub!**

---

## 🌐 **STEP 4: Set Up Database (PlanetScale - FREE)**

### A. Create PlanetScale Account
1. **Go to** [planetscale.com](https://planetscale.com)
2. **Sign up** with your GitHub account
3. **Verify** your email

### B. Create Database
1. **Click** "New database"
2. **Name**: `bracu-research-repo`
3. **Region**: Choose closest to your users
4. **Click** "Create database"

### C. Get Connection Details
1. **Go to** your database dashboard
2. **Click** "Connect"
3. **Choose** "Node.js"
4. **Copy** the connection string
5. **Save** these details:
   - Host
   - Username  
   - Password
   - Database name

### D. Import Your Schema
1. **Click** "Console" in PlanetScale
2. **Paste** the contents of your `database_schema.sql` file
3. **Run** the SQL commands
4. **Verify** tables were created

---

## 🚀 **STEP 5: Deploy Backend (Railway - FREE)**

### A. Create Railway Account
1. **Go to** [railway.app](https://railway.app)
2. **Sign up** with GitHub
3. **Connect** your GitHub account

### B. Deploy from GitHub
1. **Click** "New Project"
2. **Select** "Deploy from GitHub repo"
3. **Choose** your `bracu-research-repository`
4. **Click** "Deploy Now"

### C. Configure Environment Variables
1. **Go to** your project dashboard
2. **Click** "Variables" tab
3. **Add** these environment variables:

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-planetscale-host
DB_USER=your-planetscale-user
DB_PASSWORD=your-planetscale-password
DB_NAME=bracu-research-repo
DB_PORT=3306
JWT_SECRET=your-super-secure-production-secret-key
CORS_ORIGIN=https://your-app-name.railway.app
UPLOAD_PATH=/tmp/uploads
MAX_FILE_SIZE=10485760
```

### D. Get Your Backend URL
- **Railway** will provide a URL like: `https://your-app-name.railway.app`
- **Save this URL** - you'll need it for frontend configuration

---

## 🎨 **STEP 6: Deploy Frontend (Vercel - FREE)**

### A. Update Frontend Configuration
Before deploying, update your React app to point to the production backend:

1. **Create** `client/.env.production` file:
```env
REACT_APP_API_URL=https://your-railway-backend-url.railway.app
```

2. **Update** your axios calls to use this URL (if needed)

### B. Deploy to Vercel
1. **Go to** [vercel.com](https://vercel.com)
2. **Sign up** with GitHub
3. **Click** "New Project"
4. **Import** your GitHub repository
5. **Configure**:
   - **Framework Preset**: React
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. **Click** "Deploy"

### C. Configure Environment Variables in Vercel
1. **Go to** your project settings
2. **Add** environment variables:
```env
REACT_APP_API_URL=https://your-railway-backend-url.railway.app
```

---

## 🔧 **STEP 7: Final Configuration**

### A. Update CORS in Backend
Update your Railway backend environment:
```env
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### B. Test Your Live Application
1. **Frontend URL**: `https://your-app.vercel.app`
2. **Backend API**: `https://your-backend.railway.app/api`
3. **Test all features**:
   - Login/logout
   - Paper submission
   - Admin approval
   - Search functionality

---

## 🎉 **STEP 8: Optional - Custom Domain**

### A. Add Custom Domain (Free)
1. **In Vercel**: Go to Settings → Domains
2. **Add** your domain (e.g., `bracu-research.yourdomain.com`)
3. **Update DNS** records as instructed
4. **SSL** is automatically configured

---

## 💰 **Cost Summary**

### **FREE TIER LIMITS:**
- **PlanetScale**: 5GB database, 1B reads/month
- **Railway**: $5/month credit (covers most academic projects)
- **Vercel**: 100GB bandwidth, unlimited projects

### **For Academic Use**: Completely sufficient and FREE! 🎉

---

## 🛠️ **Alternative: All-in-One Render Deployment**

If you prefer a simpler setup:

### **Option: Render (Single Platform)**
1. **Go to** [render.com](https://render.com)
2. **Sign up** with GitHub
3. **Create Web Service** from your GitHub repo
4. **Add PostgreSQL** database (free)
5. **Minor code changes** needed for PostgreSQL

---

## 🔍 **Troubleshooting**

### **Common Issues:**
1. **CORS Errors**: Update CORS_ORIGIN to match your frontend URL
2. **Database Connection**: Verify PlanetScale connection string
3. **Environment Variables**: Ensure all variables are set correctly
4. **File Uploads**: Configure upload path for cloud storage

### **Testing Checklist:**
- [ ] Login with admin@bracu.ac.bd / admin123
- [ ] Login with author@bracu.ac.bd / author123
- [ ] Submit a paper as author
- [ ] Approve paper as admin
- [ ] Search and browse papers
- [ ] Download PDF files
- [ ] Test on mobile devices

---

**🚀 Ready to go live? Follow these steps and your BRACU Research Repository will be accessible worldwide!**
