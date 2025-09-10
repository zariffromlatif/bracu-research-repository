-- BRACU Research Repository MySQL Setup
-- Run this in your MySQL database

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bracu_repo;
USE bracu_repo;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
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
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculties table
CREATE TABLE IF NOT EXISTS faculties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Papers table
CREATE TABLE IF NOT EXISTS papers (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Co-authors table
CREATE TABLE IF NOT EXISTS co_authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paper_id INT NOT NULL,
    co_author_name VARCHAR(255),
    author_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

-- Insert sample departments
INSERT INTO departments (name, description) VALUES
('Department of Architecture', 'School of Architecture & Design'),
('Department of Computer Science and Engineering (CSE)', 'School of Data & Sciences'),
('Department of Economics and Social Sciences (ESS)', 'School of Humanities & Social Sciences'),
('Department of Electrical & Electronic Engineering (EEE)', 'BSRM School of Engineering'),
('Department of English and Humanities (ENH)', 'School of Humanities & Social Sciences'),
('Department of Law (LLB)', 'School of Law'),
('Department of Mathematics & Natural Sciences (MNS)', 'School of Data & Sciences'),
('Department of Pharmacy', 'School of Pharmacy')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample faculties/schools
INSERT INTO faculties (name, description) VALUES
('School of Architecture & Design', 'Architecture, Urban Planning, and Design disciplines'),
('School of Data & Sciences', 'Computer Science, Mathematics, and Data Sciences'),
('School of Humanities & Social Sciences', 'Economics, English, Humanities, and Social Sciences'),
('BSRM School of Engineering', 'Engineering disciplines including EEE'),
('School of Law', 'Legal studies and jurisprudence'),
('School of Pharmacy', 'Pharmaceutical sciences and practice')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role, department_id, designation) VALUES
('System Administrator', 'admin@bracu.ac.bd', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, 'faculty')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- Insert sample author user (password: author123)
INSERT INTO users (name, email, password, role, department_id, designation) VALUES
('Sample Author', 'author@bracu.ac.bd', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'author', 1, 'faculty')
ON DUPLICATE KEY UPDATE email = VALUES(email);
