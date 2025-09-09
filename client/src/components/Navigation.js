import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { FaGraduationCap, FaSearch, FaPlus, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="white" expand="lg" className="py-3 shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img 
            src="/img/bracu_logo_12-0-2022.png" 
            alt="BRACU Logo" 
            height="64" 
            className="me-3"
          />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`me-2 ${isActive('/') ? 'active fw-semibold' : ''}`}
            >
              <FaGraduationCap className="me-2" />
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/papers" 
              className={`me-2 ${isActive('/papers') ? 'active fw-semibold' : ''}`}
            >
              <FaSearch className="me-2" />
              Browse Papers
            </Nav.Link>
            {isAuthenticated() && (
              <Nav.Link 
                as={Link} 
                to="/add-paper" 
                className={`me-2 ${isActive('/add-paper') ? 'active fw-semibold' : ''}`}
              >
                <FaPlus className="me-2" />
                Add Paper
              </Nav.Link>
            )}
            {isAdmin() && (
              <Nav.Link 
                as={Link} 
                to="/admin" 
                className={`me-2 ${isActive('/admin') ? 'active fw-semibold' : ''}`}
              >
                <FaCog className="me-2" />
                Admin Panel
              </Nav.Link>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated() ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-primary" id="user-dropdown" className="d-flex align-items-center">
                  <FaUser className="me-2" />
                  {user?.name || 'User'}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Header>
                    <div className="fw-semibold">{user?.name}</div>
                    <small className="text-muted">{user?.email}</small>
                    <div className="badge bg-primary mt-1">{user?.role}</div>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" />
                    Profile
                  </Dropdown.Item>
                  {isAdmin() && (
                    <Dropdown.Item as={Link} to="/admin">
                      <FaCog className="me-2" />
                      Admin Panel
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  size="sm"
                  className="d-flex align-items-center px-3"
                >
                  <FaUser className="me-2" />
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="primary" 
                  size="sm"
                  className="d-flex align-items-center px-3"
                >
                  <FaUser className="me-2" />
                  Register
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
