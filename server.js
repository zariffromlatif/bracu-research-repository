const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'paper-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Author middleware
const requireAuthor = (req, res, next) => {
  if (req.user.role !== 'author' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Author access required' });
  }
  next();
};

// PostgreSQL Connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://root:@localhost:5432/bracu_repo',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection and create tables
db.query('SELECT NOW()', async (err, result) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err);
    return;
  }
  console.log('Connected to PostgreSQL database successfully');
  
  // Create tables if they don't exist
  try {
    await createTablesIfNotExist();
    console.log('Database tables verified/created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
});

// Function to create tables automatically
async function createTablesIfNotExist() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Read the PostgreSQL schema file
    const schemaPath = path.join(__dirname, 'postgresql_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await db.query(schema);
      console.log('Database schema imported successfully');
    } else {
      console.log('Schema file not found, creating tables manually...');
      // Create essential tables manually if schema file is missing
      await createEssentialTables();
    }
  } catch (error) {
    console.error('Error importing schema:', error);
    await createEssentialTables();
  }
}

async function createEssentialTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'author',
      department_id INTEGER,
      faculty_id INTEGER,
      designation VARCHAR(20) DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS faculties (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS papers (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      abstract TEXT NOT NULL,
      keywords TEXT,
      category_text VARCHAR(255),
      author_id INTEGER NOT NULL,
      corresponding_author VARCHAR(255),
      supervisor VARCHAR(255),
      co_supervisor VARCHAR(255),
      department_id INTEGER,
      publication_date DATE,
      doi VARCHAR(255),
      file_url VARCHAR(500),
      file_name VARCHAR(255),
      file_size INTEGER,
      status VARCHAR(20) DEFAULT 'pending',
      admin_notes TEXT,
      version INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];
  
  for (const tableQuery of tables) {
    await db.query(tableQuery);
  }
  
  // Insert sample data
  await db.query(`
    INSERT INTO departments (name, description) VALUES
    ('Department of Computer Science and Engineering (CSE)', 'School of Data & Sciences'),
    ('Department of Architecture', 'School of Architecture & Design'),
    ('Department of Economics and Social Sciences (ESS)', 'School of Humanities & Social Sciences')
    ON CONFLICT (name) DO NOTHING
  `);
  
  await db.query(`
    INSERT INTO users (name, email, password, role, department_id, designation) VALUES
    ('System Administrator', 'admin@bracu.ac.bd', '$2b$10$VpNn9nJvvQWz4hPzQzQzQeJ9J9J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'admin', 1, 'faculty'),
    ('Sample Author', 'author@bracu.ac.bd', '$2b$10$VpNn9nJvvQWz4hPzQzQzQeJ9J9J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'author', 1, 'faculty')
    ON CONFLICT (email) DO NOTHING
  `);
}

// Authentication Routes

// User registration
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, department_id, faculty_id } = req.body;
  
  try {
    // Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error checking user:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      const insertQuery = `
        INSERT INTO users (name, email, password, role, department_id, faculty_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const params = [name, email, hashedPassword, role, department_id, faculty_id];
      
      db.query(insertQuery, params, (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ 
          message: 'User registered successfully',
          id: result.insertId 
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const query = `
    SELECT u.*, d.name as department_name, f.name as faculty_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN faculties f ON u.faculty_id = f.id
    WHERE u.email = ?
  `;
  
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = results[0];
    
    try {
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          name: user.name 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      // Remove password from response
      delete user.password;
      
      res.json({
        message: 'Login successful',
        token,
        user
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const query = `
    SELECT u.id, u.name, u.email, u.role, u.department_id, u.faculty_id, u.designation, u.created_at, u.updated_at,
           d.name as department_name, f.name as faculty_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN faculties f ON u.faculty_id = f.id
    WHERE u.id = ?
  `;
  
  db.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(results[0]);
  });
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { name, department_id, faculty_id, designation } = req.body;
  
  // Validate required fields
  if (!name || !department_id || !faculty_id || !designation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const updateQuery = `
    UPDATE users 
    SET name = ?, department_id = ?, faculty_id = ?, designation = ?, updated_at = NOW()
    WHERE id = ?
  `;
  
  const params = [name, department_id, faculty_id, designation, req.user.id];
  
  db.query(updateQuery, params, (err, result) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch updated profile to return
    const fetchQuery = `
      SELECT u.id, u.name, u.email, u.role, u.department_id, u.faculty_id, u.designation, u.created_at, u.updated_at,
             d.name as department_name, f.name as faculty_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN faculties f ON u.faculty_id = f.id
      WHERE u.id = ?
    `;
    
    db.query(fetchQuery, [req.user.id], (err, results) => {
      if (err) {
        console.error('Error fetching updated profile:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results[0]);
    });
  });
});

// API Routes

// Get all research papers (public - no auth required)
app.get('/api/papers', (req, res) => {
  const query = `
    SELECT 
      p.*, 
      u.name as author_name,
      d.name as department_name,
      f.name as faculty_name
    FROM papers p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN faculties f ON p.faculty_id = f.id
    WHERE p.status = 'approved'
    ORDER BY p.publication_date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching papers:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get paper by ID (public - no auth required)
app.get('/api/papers/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      p.*, 
      u.name as author_name,
      u.email as author_email,
      d.name as department_name,
      f.name as faculty_name
    FROM papers p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN faculties f ON p.faculty_id = f.id
    WHERE p.id = ? AND p.status = 'approved'
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching paper:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json(results[0]);
  });
});

// Search papers (public - no auth required)
app.get('/api/search', (req, res) => {
  const { q, department, category, year } = req.query;
  
  let query = `
    SELECT 
      p.*, 
      u.name as author_name,
      d.name as department_name
    FROM papers p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN departments d ON p.department_id = d.id
    WHERE p.status = 'approved'
  `;
  
  const params = [];
  
  if (q) {
    query += ` AND (p.title LIKE ? OR p.abstract LIKE ? OR p.keywords LIKE ? OR p.category_text LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  
  if (department) {
    query += ` AND d.name = ?`;
    params.push(department);
  }
  
  if (category) {
    query += ` AND p.category_text LIKE ?`;
    params.push(`%${category}%`);
  }
  
  if (year) {
    query += ` AND YEAR(p.publication_date) = ?`;
    params.push(year);
  }
  
  query += ` ORDER BY p.publication_date DESC`;
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error searching papers:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get departments (public - no auth required)
app.get('/api/departments', (req, res) => {
  const query = 'SELECT * FROM departments ORDER BY name';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get faculties (public - no auth required)
app.get('/api/faculties', (req, res) => {
  const query = 'SELECT * FROM faculties ORDER BY name';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching faculties:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get authors (public - no auth required)
app.get('/api/authors', (req, res) => {
  const query = 'SELECT * FROM authors ORDER BY name';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching authors:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get unique categories from papers (public - no auth required)
app.get('/api/categories', (req, res) => {
  const query = `
    SELECT DISTINCT category_text as name, category_text as id 
    FROM papers 
    WHERE status = 'approved' AND category_text IS NOT NULL AND category_text != ''
    ORDER BY category_text
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get dashboard statistics (public - no auth required)
app.get('/api/stats', (req, res) => {
  const queries = {
    papers: "SELECT COUNT(*) as count FROM papers WHERE status = 'approved'",
    authors: "SELECT COUNT(DISTINCT author_id) as count FROM papers WHERE status = 'approved'",
    departments: 'SELECT COUNT(*) as count FROM departments',
    // BRAC University was founded in 2001, so calculate years from 2001
    years: 'SELECT (EXTRACT(YEAR FROM CURRENT_DATE) - 2001) as count'
  };

  const stats = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, results) => {
      if (err) {
        console.error(`Error fetching ${key} stats:`, err);
        stats[key] = 0;
      } else {
        stats[key] = results[0].count;
      }
      
      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json(stats);
      }
    });
  });
});

// Add new paper (requires author or admin auth)
app.post('/api/papers', authenticateToken, requireAuthor, upload.single('file'), (req, res) => {
  const { title, abstract, keywords, category, department_id, publication_date, doi, corresponding_author, supervisor, co_supervisor, co_authors } = req.body;
  
  // Validate required fields
  if (!title || !abstract || !keywords || !category || !department_id || !publication_date || !corresponding_author) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'PDF file is required' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  
  // First, add new columns if they don't exist
  const alterTableQuery = `
    ALTER TABLE papers 
    ADD COLUMN IF NOT EXISTS corresponding_author VARCHAR(255) AFTER author_id,
    ADD COLUMN IF NOT EXISTS supervisor VARCHAR(255) AFTER corresponding_author,
    ADD COLUMN IF NOT EXISTS co_supervisor VARCHAR(255) AFTER supervisor,
    ADD COLUMN IF NOT EXISTS category_text VARCHAR(255) AFTER keywords
  `;
  
  db.query(alterTableQuery, (alterErr) => {
    if (alterErr) {
      console.log('Columns might already exist or other error:', alterErr.message);
    }
    
    const query = `
      INSERT INTO papers (title, abstract, keywords, category_text, author_id, corresponding_author, supervisor, co_supervisor, department_id, publication_date, doi, file_url, file_name, file_size, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;
    
    const params = [
      title, 
      abstract, 
      keywords,
      category, 
      req.user.id,
      corresponding_author,
      supervisor || null,
      co_supervisor || null,
      department_id, 
      publication_date, 
      doi, 
      fileUrl,
      req.file.originalname,
      req.file.size
    ];
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error adding paper:', err);
      // Delete uploaded file if database insert fails
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const paperId = result.insertId;
    
    // Handle co-authors if provided
    if (co_authors && co_authors.length > 0) {
      try {
        const coAuthorsArray = JSON.parse(co_authors);
        if (Array.isArray(coAuthorsArray)) {
          // First, add co_author_name column if it doesn't exist
          const alterCoAuthorsQuery = `
            ALTER TABLE co_authors 
            ADD COLUMN IF NOT EXISTS co_author_name VARCHAR(255) AFTER paper_id
          `;
          
          db.query(alterCoAuthorsQuery, (coAuthorAlterErr) => {
            if (coAuthorAlterErr) {
              console.log('Co-author column might already exist:', coAuthorAlterErr.message);
            }
            
            coAuthorsArray.forEach((coAuthor, index) => {
              if (coAuthor.name && coAuthor.name.trim()) {
                const coAuthorQuery = `
                  INSERT INTO co_authors (paper_id, co_author_name, author_order, created_at)
                  VALUES (?, ?, ?, NOW())
                `;
                db.query(coAuthorQuery, [paperId, coAuthor.name.trim(), coAuthor.order || index + 1]);
              }
            });
          });
        }
      } catch (parseError) {
        console.error('Error parsing co-authors:', parseError);
        // Don't fail the entire request for co-author parsing errors
      }
    }
    
    res.status(201).json({ 
      message: 'Paper submitted successfully and pending approval', 
      id: paperId,
      fileUrl: fileUrl
    });
  });
  });
});

// Update paper (requires author or admin auth)
app.put('/api/papers/:id', authenticateToken, requireAuthor, (req, res) => {
  const { id } = req.params;
  const { title, abstract, keywords, department_id, faculty_id, publication_date, doi, file_url } = req.body;
  
  // Check if user owns the paper or is admin
  const checkQuery = 'SELECT author_id FROM papers WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Error checking paper ownership:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    
    if (req.user.role !== 'admin' && results[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own papers' });
    }
    
    const updateQuery = `
      UPDATE papers 
      SET title = ?, abstract = ?, keywords = ?, department_id = ?, 
          faculty_id = ?, publication_date = ?, doi = ?, file_url = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const params = [title, abstract, keywords, department_id, faculty_id, publication_date, doi, file_url, id];
    
    db.query(updateQuery, params, (err, result) => {
      if (err) {
        console.error('Error updating paper:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Paper updated successfully' });
    });
  });
});

// Delete paper (requires author or admin auth)
app.delete('/api/papers/:id', authenticateToken, requireAuthor, (req, res) => {
  const { id } = req.params;
  
  // Check if user owns the paper or is admin
  const checkQuery = 'SELECT author_id FROM papers WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Error checking paper ownership:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    
    if (req.user.role !== 'admin' && results[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own papers' });
    }
    
    const deleteQuery = 'DELETE FROM papers WHERE id = ?';
    
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error('Error deleting paper:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Paper deleted successfully' });
    });
  });
});

// Admin Routes

// Get all papers for admin (including pending)
app.get('/api/admin/papers', authenticateToken, requireAdmin, (req, res) => {
  const query = `
    SELECT 
      p.*, 
      u.name as author_name,
      d.name as department_name,
      f.name as faculty_name
    FROM papers p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN faculties f ON p.faculty_id = f.id
    ORDER BY p.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching papers:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Approve/reject paper (admin only)
app.put('/api/admin/papers/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const query = `
    UPDATE papers 
    SET status = ?, admin_notes = ?, updated_at = NOW()
    WHERE id = ?
  `;
  
  const params = [status, admin_notes, id];
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating paper status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json({ message: `Paper ${status} successfully` });
  });
});

// Get pending papers count (admin only)
app.get('/api/admin/pending-count', authenticateToken, requireAdmin, (req, res) => {
  const query = 'SELECT COUNT(*) as count FROM papers WHERE status = "pending"';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching pending count:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ count: results[0].count });
  });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Multer error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Only one file allowed.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name.' });
    }
  }
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: 'Only PDF files are allowed.' });
  }
  next(err);
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
