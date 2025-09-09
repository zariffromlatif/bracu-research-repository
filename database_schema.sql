-- BRACU Research Repository Database Schema
-- Run this script in your MySQL database to create all required tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bracu_repo;
USE bracu_repo;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('author', 'admin') DEFAULT 'author',
    department_id INT,
    faculty_id INT,
    designation ENUM('student', 'faculty') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
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

-- Authors table (for paper authors)
CREATE TABLE IF NOT EXISTS authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    affiliation VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
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
    author_id INT NOT NULL,
    department_id INT,
    faculty_id INT,
    category_id INT,
    publication_date DATE,
    doi VARCHAR(255),
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_author (author_id),
    INDEX idx_publication_date (publication_date),
    FULLTEXT idx_search (title, abstract, keywords)
);

-- Co-authors table
CREATE TABLE IF NOT EXISTS co_authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paper_id INT NOT NULL,
    author_id INT NOT NULL,
    author_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_paper_author (paper_id, author_id)
);

-- Paper versions table (for version control)
CREATE TABLE IF NOT EXISTS paper_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paper_id INT NOT NULL,
    version_number INT NOT NULL,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INT,
    change_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    INDEX idx_paper_version (paper_id, version_number)
);

-- Insert sample data
-- Insert BRAC University Schools (as faculties)
INSERT INTO faculties (name, description) VALUES
('School of Architecture & Design', 'Architecture, Urban Planning, and Design disciplines'),
('School of Data & Sciences', 'Computer Science, Mathematics, and Data Sciences'),
('School of Humanities & Social Sciences', 'Economics, English, Humanities, and Social Sciences'),
('BSRM School of Engineering', 'Engineering disciplines including EEE'),
('School of Law', 'Legal studies and jurisprudence'),
('School of Pharmacy', 'Pharmaceutical sciences and practice');

-- Insert BRAC University Departments
INSERT INTO departments (name, description) VALUES
('Department of Architecture', 'School of Architecture & Design'),
('Department of Computer Science and Engineering (CSE)', 'School of Data & Sciences'),
('Department of Economics and Social Sciences (ESS)', 'School of Humanities & Social Sciences'),
('Department of Electrical & Electronic Engineering (EEE)', 'BSRM School of Engineering'),
('Department of English and Humanities (ENH)', 'School of Humanities & Social Sciences'),
('Department of Law (LLB)', 'School of Law'),
('Department of Mathematics & Natural Sciences (MNS)', 'School of Data & Sciences'),
('Department of Pharmacy', 'School of Pharmacy');

INSERT INTO categories (name, description) VALUES
('Computer Science', 'Computer Science and Technology'),
('Business', 'Business and Management'),
('Economics', 'Economics and Finance'),
('Social Sciences', 'Social Sciences and Humanities'),
('Mathematics', 'Mathematics and Statistics'),
('Natural Sciences', 'Natural Sciences and Biology');

INSERT INTO authors (name, email, affiliation) VALUES
('Dr. John Smith', 'john.smith@bracu.ac.bd', 'BRAC University'),
('Dr. Sarah Johnson', 'sarah.johnson@bracu.ac.bd', 'BRAC University'),
('Dr. Ahmed Rahman', 'ahmed.rahman@bracu.ac.bd', 'BRAC University'),
('Dr. Fatima Khan', 'fatima.khan@bracu.ac.bd', 'BRAC University');

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role, department_id, faculty_id, designation) VALUES
('System Administrator', 'admin@bracu.ac.bd', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, 1, 'faculty');

-- Insert sample author user (password: author123)
INSERT INTO users (name, email, password, role, department_id, faculty_id, designation) VALUES
('Sample Author', 'author@bracu.ac.bd', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'author', 1, 1, 'faculty');

-- Insert sample papers
INSERT INTO papers (title, abstract, keywords, author_id, department_id, faculty_id, category_id, publication_date, doi, status) VALUES
('Machine Learning Applications in Healthcare', 'This paper explores the various applications of machine learning in healthcare, including diagnosis, treatment planning, and patient monitoring.', 'machine learning, healthcare, AI, diagnosis', 2, 1, 1, 1, '2024-01-15', '10.1000/example.doi.1', 'approved'),
('Sustainable Business Practices in Bangladesh', 'An analysis of sustainable business practices adopted by companies in Bangladesh and their impact on economic growth.', 'sustainability, business, Bangladesh, economic growth', 2, 2, 2, 2, '2024-02-20', '10.1000/example.doi.2', 'approved'),
('Social Media Impact on Youth Education', 'A comprehensive study on how social media platforms affect the educational outcomes of young people in developing countries.', 'social media, education, youth, developing countries', 2, 3, 3, 4, '2024-03-10', '10.1000/example.doi.3', 'pending');

-- Create uploads directory structure (this will be handled by the application)
-- The uploads directory should be created in the project root
