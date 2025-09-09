import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Nav, Tab } from 'react-bootstrap';
import { FaSignInAlt, FaUserPlus, FaEnvelope, FaLock, FaUser, FaGraduationCap, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'author',
    designation: 'student',
    department_id: ''
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Fetch departments on component mount
  React.useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setDepartments(data);
      } else {
        console.error('Departments data is not an array:', data);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register(registerData);
    
    if (result.success) {
      setSuccess(result.message + '. You can now login.');
      setActiveTab('login');
      setRegisterData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'author',
        designation: 'student',
        department_id: ''
      });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'login') {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h4 className="mb-0">
                <FaGraduationCap className="me-2" />
                BRACU Research Repository
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs" className="mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="login" className="d-flex align-items-center">
                      <FaSignInAlt className="me-2" />
                      Login
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="register" className="d-flex align-items-center">
                      <FaUserPlus className="me-2" />
                      Register
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  {/* Login Tab */}
                  <Tab.Pane eventKey="login">
                    <Form onSubmit={handleLogin}>
                      {error && <Alert variant="danger">{error}</Alert>}
                      {success && <Alert variant="success">{success}</Alert>}
                      
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaEnvelope className="me-2" />
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={loginData.email}
                          onChange={(e) => handleInputChange(e, 'login')}
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>
                          <FaLock className="me-2" />
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={loginData.password}
                          onChange={(e) => handleInputChange(e, 'login')}
                          placeholder="Enter your password"
                          required
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-100"
                        disabled={loading}
                      >
                        {loading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </Form>
                  </Tab.Pane>

                  {/* Register Tab */}
                  <Tab.Pane eventKey="register">
                    <Form onSubmit={handleRegister}>
                      {error && <Alert variant="danger">{error}</Alert>}
                      {success && <Alert variant="success">{success}</Alert>}
                      
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaUser className="me-2" />
                          Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={registerData.name}
                          onChange={(e) => handleInputChange(e, 'register')}
                          placeholder="Enter your full name"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaEnvelope className="me-2" />
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={registerData.email}
                          onChange={(e) => handleInputChange(e, 'register')}
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaLock className="me-2" />
                              Password
                            </Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={registerData.password}
                              onChange={(e) => handleInputChange(e, 'register')}
                              placeholder="Enter password"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaLock className="me-2" />
                              Confirm Password
                            </Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={registerData.confirmPassword}
                              onChange={(e) => handleInputChange(e, 'register')}
                              placeholder="Confirm password"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaUser className="me-2" />
                              Role
                            </Form.Label>
                            <Form.Select
                              name="role"
                              value={registerData.role}
                              onChange={(e) => handleInputChange(e, 'register')}
                              required
                            >
                              <option value="author">Author</option>
                              <option value="admin">Admin</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaGraduationCap className="me-2" />
                              Designation
                            </Form.Label>
                            <Form.Select
                              name="designation"
                              value={registerData.designation}
                              onChange={(e) => handleInputChange(e, 'register')}
                              required
                            >
                              <option value="student">Student</option>
                              <option value="faculty">Faculty</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-4">
                        <Form.Label>
                          <FaBuilding className="me-2" />
                          Department
                        </Form.Label>
                        <Form.Select
                          name="department_id"
                          value={registerData.department_id}
                          onChange={(e) => handleInputChange(e, 'register')}
                          required
                        >
                          <option value="">Select Department</option>
                          {Array.isArray(departments) && departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="success"
                        size="lg"
                        className="w-100"
                        disabled={loading}
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
