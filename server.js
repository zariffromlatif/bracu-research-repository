const express = require('express');
const mysql = require('mysql2/promise');
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

// MySQL Connection Pool (promise-based)
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bracu_repo',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// Fallback connection for development
if (!process.env.DB_HOST) {
  console.log('Using default MySQL connection settings');
}

// Test database connection and create tables
(async () => {
  try {
    await db.query('SELECT NOW()');
    console.log('Connected to MySQL database successfully');

    await createTablesIfNotExist();
    console.log('Database tables verified/created successfully');

    await verifyEssentialData();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
})();

// Function to verify essential data exists
async function verifyEssentialData() {
  try {
    // Check if departments exist
    const [deptRows] = await db.query('SELECT COUNT(*) as count FROM departments');
    if ((deptRows[0] && deptRows[0].count) === 0) {
      console.log('No departments found, inserting sample data...');
      await createEssentialTables();
    } else {
      console.log(`Found ${deptRows[0].count} departments`);
    }
    
    // Check if default users exist
    const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
    if ((userRows[0] && userRows[0].count) === 0) {
      console.log('No users found, creating default users...');
      await createDefaultUsers();
    } else {
      console.log(`Found ${userRows[0].count} users`);
    }
  } catch (error) {
    console.error('Error verifying essential data:', error);
  }
}

// Function to create default users
async function createDefaultUsers() {
  try {
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const authorPassword = await bcrypt.hash('author123', 10);
    
    await db.query(
      `INSERT INTO users (name, email, password, role, department_id, designation)
       VALUES (?, ?, ?, 'admin', 1, 'faculty')
       ON DUPLICATE KEY UPDATE email = VALUES(email)`,
      ['System Administrator', 'admin@bracu.ac.bd', adminPassword]
    );

    await db.query(
      `INSERT INTO users (name, email, password, role, department_id, designation)
       VALUES (?, ?, ?, 'author', 1, 'faculty')
       ON DUPLICATE KEY UPDATE email = VALUES(email)`,
      ['Sample Author', 'author@bracu.ac.bd', authorPassword]
    );
    
    console.log('Default users created successfully');
  } catch (error) {
    console.error('Error creating default users:', error);
  }
}

// Function to create tables automatically
async function createTablesIfNotExist() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Read the MySQL schema file
    const schemaPath = path.join(__dirname, 'database_schema.sql');
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
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'author',
      department_id INT,
      faculty_id INT,
      designation VARCHAR(20) DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS faculties (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS papers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      abstract TEXT NOT NULL,
      keywords TEXT,
      category_text VARCHAR(255),
      author_id INT NOT NULL,
      corresponding_author VARCHAR(255),
      supervisor VARCHAR(255),
      co_supervisor VARCHAR(255),
      department_id INT,
      publication_date DATE,
      doi VARCHAR(255),
      file_url VARCHAR(500),
      file_name VARCHAR(255),
      file_size INT,
      status VARCHAR(20) DEFAULT 'pending',
      admin_notes TEXT,
      version INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  ];
  
  for (const tableQuery of tables) {
    await db.query(tableQuery);
  }
  
  // Insert sample departments
  await db.query(`
    INSERT INTO departments (name, description) VALUES
    ('Department of Architecture', 'School of Architecture & Design'),
    ('Department of Computer Science and Engineering (CSE)', 'School of Data & Sciences'),
    ('Department of Economics and Social Sciences (ESS)', 'School of Humanities & Social Sciences'),
    ('Department of Electrical & Electronic Engineering (EEE)', 'BSRM School of Engineering'),
    ('Department of English and Humanities (ENH)', 'School of Humanities & Social Sciences'),
    ('Department of Law (LLB)', 'School of Law'),
    ('Department of Mathematics & Natural Sciences (MNS)', 'School of Data & Sciences'),
    ('Department of Pharmacy', 'School of Pharmacy')
    ON DUPLICATE KEY UPDATE name = VALUES(name)
  `);
  
  // Insert sample faculties/schools
  await db.query(`
    INSERT INTO faculties (name, description) VALUES
    ('School of Architecture & Design', 'Architecture, Urban Planning, and Design disciplines'),
    ('School of Data & Sciences', 'Computer Science, Mathematics, and Data Sciences'),
    ('School of Humanities & Social Sciences', 'Economics, English, Humanities, and Social Sciences'),
    ('BSRM School of Engineering', 'Engineering disciplines including EEE'),
    ('School of Law', 'Legal studies and jurisprudence'),
    ('School of Pharmacy', 'Pharmaceutical sciences and practice')
    ON DUPLICATE KEY UPDATE name = VALUES(name)
  `);
  
  // Hash passwords properly for PostgreSQL
  const bcrypt = require('bcryptjs');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const authorPassword = await bcrypt.hash('author123', 10);
  
  await db.query(
    `INSERT INTO users (name, email, password, role, department_id, designation)
     VALUES (?, ?, ?, 'admin', 1, 'faculty')
     ON DUPLICATE KEY UPDATE email = VALUES(email)`,
    ['System Administrator', 'admin@bracu.ac.bd', adminPassword]
  );
  await db.query(
    `INSERT INTO users (name, email, password, role, department_id, designation)
     VALUES (?, ?, ?, 'author', 1, 'faculty')
     ON DUPLICATE KEY UPDATE email = VALUES(email)`,
    ['Sample Author', 'author@bracu.ac.bd', authorPassword]
  );
}

// Authentication Routes

// User registration
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, department_id, faculty_id } = req.body;
  
  try {
    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (name, email, password, role, department_id, faculty_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const params = [name, email, hashedPassword, role, department_id, faculty_id];
    const [result] = await db.query(insertQuery, params);

    res.status(201).json({ 
      message: 'User registered successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const query = `
    SELECT u.*, d.name as department_name, f.name as faculty_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN faculties f ON u.faculty_id = f.id
    WHERE u.email = ?
  `;
  
  try {
    const [rows] = await db.query(query, [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete user.password;
    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  const query = `
    SELECT u.id, u.name, u.email, u.role, u.department_id, u.faculty_id, u.designation, u.created_at, u.updated_at,
           d.name as department_name, f.name as faculty_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN faculties f ON u.faculty_id = f.id
    WHERE u.id = ?
  `;
  
  try {
    const [rows] = await db.query(query, [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
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
  
  try {
    const [result] = await db.query(updateQuery, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const fetchQuery = `
      SELECT u.id, u.name, u.email, u.role, u.department_id, u.faculty_id, u.designation, u.created_at, u.updated_at,
             d.name as department_name, f.name as faculty_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN faculties f ON u.faculty_id = f.id
      WHERE u.id = ?
    `;
    const [rows] = await db.query(fetchQuery, [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// API Routes

// Get all research papers (public - no auth required)
app.get('/api/papers', async (req, res) => {
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
  
  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching papers:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get paper by ID (public - no auth required)
app.get('/api/papers/:id', async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  let query = `
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
    WHERE p.id = ?
  `;
  
  // If no token provided, only show approved papers
  if (!token) {
    query += ` AND p.status = 'approved'`;
  } else {
    // Check if user is admin
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
      
      // If user is admin, show all papers regardless of status
      if (userRows.length > 0 && userRows[0].role === 'admin') {
        // Admin can see all papers - no additional WHERE clause needed
      } else {
        // Non-admin users can only see approved papers
        query += ` AND p.status = 'approved'`;
      }
    } catch (jwtError) {
      // Invalid token, only show approved papers
      query += ` AND p.status = 'approved'`;
    }
  }
  
  try {
    const [rows] = await db.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching paper:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Search papers (public - no auth required)
app.get('/api/search', async (req, res) => {
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
    query += ` AND EXTRACT(YEAR FROM p.publication_date) = ?`;
    params.push(year);
  }
  
  query += ` ORDER BY p.publication_date DESC`;
  
  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error searching papers:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get departments (public - no auth required)
app.get('/api/departments', async (req, res) => {
  const query = 'SELECT * FROM departments ORDER BY name';
  
  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get faculties (public - no auth required)
app.get('/api/faculties', async (req, res) => {
  const query = 'SELECT * FROM faculties ORDER BY name';
  
  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching faculties:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get authors (public - no auth required)
app.get('/api/authors', async (req, res) => {
  const query = 'SELECT * FROM authors ORDER BY name';
  
  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching authors:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get unique categories from papers (public - no auth required)
app.get('/api/categories', async (req, res) => {
  const query = `
    SELECT DISTINCT category_text as name, category_text as id 
    FROM papers 
    WHERE status = 'approved' AND category_text IS NOT NULL AND category_text != ''
    ORDER BY category_text
  `;
  
  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get dashboard statistics (public - no auth required)
app.get('/api/stats', async (req, res) => {
  try {
    // Get approved papers count
    const [papersResult] = await db.query("SELECT COUNT(*) as count FROM papers WHERE status = 'approved'");
    const papersCount = papersResult[0]?.count || 0;

    // Get unique authors count from approved papers
    const [authorsResult] = await db.query("SELECT COUNT(DISTINCT author_id) as count FROM papers WHERE status = 'approved'");
    const authorsCount = authorsResult[0]?.count || 0;

    // Get departments count
    const [departmentsResult] = await db.query('SELECT COUNT(*) as count FROM departments');
    const departmentsCount = departmentsResult[0]?.count || 0;

    // Calculate BRAC University years (founded in 2001)
    const currentYear = new Date().getFullYear();
    const bracuYears = currentYear - 2001; // BRAC University was founded in 2001

    console.log('Stats calculated:', {
      papers: papersCount,
      authors: authorsCount,
      departments: departmentsCount,
      years: bracuYears
    });

    res.json({
      papers: papersCount,
      authors: authorsCount,
      departments: departmentsCount,
      years: bracuYears
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    // Return fallback values
    const currentYear = new Date().getFullYear();
    const bracuYears = currentYear - 2001;
    res.json({ 
      papers: 0, 
      authors: 0, 
      departments: 8, // BRAC University has 8 departments
      years: bracuYears 
    });
  }
});

// Debug endpoint to check database status
app.get('/api/debug/stats', async (req, res) => {
  try {
    const [papersAll] = await db.query('SELECT COUNT(*) as count FROM papers');
    const [papersApproved] = await db.query("SELECT COUNT(*) as count FROM papers WHERE status = 'approved'");
    const [departments] = await db.query('SELECT COUNT(*) as count FROM departments');
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    
    res.json({
      totalPapers: papersAll[0]?.count || 0,
      approvedPapers: papersApproved[0]?.count || 0,
      departments: departments[0]?.count || 0,
      users: users[0]?.count || 0,
      bracuYears: new Date().getFullYear() - 2001
    });
  } catch (err) {
    console.error('Debug stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add new paper (requires author or admin auth)
app.post('/api/papers', authenticateToken, requireAuthor, upload.single('file'), async (req, res) => {
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
  
  try {
    await db.query(alterTableQuery);
  } catch (alterErr) {
    console.log('Columns might already exist or other error:', alterErr.message);
  }

  const insertPaperQuery = `
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

  try {
    const [result] = await db.query(insertPaperQuery, params);
    const paperId = result.insertId;

    if (co_authors && co_authors.length > 0) {
      try {
        const coAuthorsArray = JSON.parse(co_authors);
        if (Array.isArray(coAuthorsArray)) {
          try {
            await db.query(`
              ALTER TABLE co_authors 
              ADD COLUMN IF NOT EXISTS co_author_name VARCHAR(255) AFTER paper_id
            `);
          } catch (coAuthorAlterErr) {
            console.log('Co-author column might already exist:', coAuthorAlterErr.message);
          }

          const insertCoAuthorQuery = `
            INSERT INTO co_authors (paper_id, co_author_name, author_order, created_at)
            VALUES (?, ?, ?, NOW())
          `;
          for (let index = 0; index < coAuthorsArray.length; index++) {
            const coAuthor = coAuthorsArray[index];
            if (coAuthor.name && coAuthor.name.trim()) {
              await db.query(insertCoAuthorQuery, [paperId, coAuthor.name.trim(), coAuthor.order || index + 1]);
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing co-authors:', parseError);
      }
    }

    res.status(201).json({ message: 'Paper submitted successfully and pending approval', id: paperId, fileUrl: fileUrl });
  } catch (err) {
    console.error('Error adding paper:', err);
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Update paper (requires author or admin auth)
app.put('/api/papers/:id', authenticateToken, requireAuthor, async (req, res) => {
  const { id } = req.params;
  const { title, abstract, keywords, department_id, faculty_id, publication_date, doi, file_url } = req.body;
  
  // Check if user owns the paper or is admin
  try {
    const [ownRows] = await db.query('SELECT author_id FROM papers WHERE id = ?', [id]);
    if (ownRows.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    if (req.user.role !== 'admin' && ownRows[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own papers' });
    }

    const updateQuery = `
      UPDATE papers 
      SET title = ?, abstract = ?, keywords = ?, department_id = ?, 
          faculty_id = ?, publication_date = ?, doi = ?, file_url = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const params = [title, abstract, keywords, department_id, faculty_id, publication_date, doi, file_url, id];
    await db.query(updateQuery, params);
    res.json({ message: 'Paper updated successfully' });
  } catch (err) {
    console.error('Error updating paper:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Delete paper (requires author or admin auth)
app.delete('/api/papers/:id', authenticateToken, requireAuthor, async (req, res) => {
  const { id } = req.params;
  
  // Check if user owns the paper or is admin
  try {
    const [rows] = await db.query('SELECT author_id FROM papers WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    if (req.user.role !== 'admin' && rows[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own papers' });
    }
    await db.query('DELETE FROM papers WHERE id = ?', [id]);
    res.json({ message: 'Paper deleted successfully' });
  } catch (err) {
    console.error('Error deleting paper:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Admin Routes

// Get all papers for admin (including pending)
app.get('/api/admin/papers', authenticateToken, requireAdmin, async (req, res) => {
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
  
  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching papers:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Approve/reject paper (admin only)
app.put('/api/admin/papers/:id/status', authenticateToken, requireAdmin, async (req, res) => {
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
  
  try {
    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json({ message: `Paper ${status} successfully` });
  } catch (err) {
    console.error('Error updating paper status:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get pending papers count (admin only)
app.get('/api/admin/pending-count', authenticateToken, requireAdmin, async (req, res) => {
  const query = 'SELECT COUNT(*) as count FROM papers WHERE status = \'pending\'';
  try {
    const [rows] = await db.query(query);
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('Error fetching pending count:', err);
    return res.status(500).json({ error: 'Database error' });
  }
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
