-- BRACU Research Repository PostgreSQL Schema
-- Converted from MySQL to PostgreSQL

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'author' CHECK (role IN ('author', 'admin')),
    department_id INTEGER,
    faculty_id INTEGER,
    designation VARCHAR(20) DEFAULT 'student' CHECK (designation IN ('student', 'faculty')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculties table (Schools)
CREATE TABLE IF NOT EXISTS faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Papers table
CREATE TABLE IF NOT EXISTS papers (
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
    faculty_id INTEGER,
    category_id INTEGER,
    publication_date DATE,
    doi VARCHAR(255),
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL
);

-- Co-authors table
CREATE TABLE IF NOT EXISTS co_authors (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL,
    co_author_name VARCHAR(255),
    author_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

-- Paper versions table
CREATE TABLE IF NOT EXISTS paper_versions (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    change_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

-- Insert BRAC University Schools (as faculties)
INSERT INTO faculties (name, description) VALUES
('School of Architecture & Design', 'Architecture, Urban Planning, and Design disciplines'),
('School of Data & Sciences', 'Computer Science, Mathematics, and Data Sciences'),
('School of Humanities & Social Sciences', 'Economics, English, Humanities, and Social Sciences'),
('BSRM School of Engineering', 'Engineering disciplines including EEE'),
('School of Law', 'Legal studies and jurisprudence'),
('School of Pharmacy', 'Pharmaceutical sciences and practice')
ON CONFLICT (name) DO NOTHING;

-- Insert BRAC University Departments
INSERT INTO departments (name, description) VALUES
('Department of Architecture', 'School of Architecture & Design'),
('Department of Computer Science and Engineering (CSE)', 'School of Data & Sciences'),
('Department of Economics and Social Sciences (ESS)', 'School of Humanities & Social Sciences'),
('Department of Electrical & Electronic Engineering (EEE)', 'BSRM School of Engineering'),
('Department of English and Humanities (ENH)', 'School of Humanities & Social Sciences'),
('Department of Law (LLB)', 'School of Law'),
('Department of Mathematics & Natural Sciences (MNS)', 'School of Data & Sciences'),
('Department of Pharmacy', 'School of Pharmacy')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role, department_id, faculty_id, designation) VALUES
('System Administrator', 'admin@bracu.ac.bd', '$2b$10$VpNn9nJvvQWz4hPzQzQzQeJ9J9J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'admin', 1, 1, 'faculty')
ON CONFLICT (email) DO NOTHING;

-- Insert sample author user (password: author123)
INSERT INTO users (name, email, password, role, department_id, faculty_id, designation) VALUES
('Sample Author', 'author@bracu.ac.bd', '$2b$10$VpNn9nJvvQWz4hPzQzQzQeJ9J9J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'author', 1, 1, 'faculty')
ON CONFLICT (email) DO NOTHING;
