import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaUniversity, FaBuilding, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department_id: '',
    faculty_id: '',
    designation: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department_id: user.department_id || '',
        faculty_id: user.faculty_id || '',
        designation: user.designation || 'student'
      });
    }
  }, [user]);

  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await axios.get('/api/faculties');
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/auth/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update user context
      updateUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      department_id: user.department_id || '',
      faculty_id: user.faculty_id || '',
      designation: user.designation || 'student'
    });
    setIsEditing(false);
  };

  if (!isAuthenticated()) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="warning" className="text-center">
              <h5>Access Denied</h5>
              <p>Please log in to view your profile.</p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'author': return 'primary';
      default: return 'secondary';
    }
  };

  const getDesignationBadgeColor = (designation) => {
    switch (designation) {
      case 'faculty': return 'success';
      case 'student': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <FaUser className="me-2" />
                  My Profile
                </h4>
                {!isEditing ? (
                  <Button 
                    variant="light" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="d-flex align-items-center"
                  >
                    <FaEdit className="me-1" />
                    Edit Profile
                  </Button>
                ) : (
                  <div>
                    <Button 
                      variant="light" 
                      size="sm" 
                      onClick={handleCancel}
                      className="me-2"
                    >
                      <FaTimes className="me-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {isEditing ? (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled
                        />
                        <Form.Text className="text-muted">
                          Email cannot be changed
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Faculty</Form.Label>
                        <Form.Select
                          name="faculty_id"
                          value={formData.faculty_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Faculty</option>
                          {faculties.map(faculty => (
                            <option key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Select
                          name="department_id"
                          value={formData.department_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map(department => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Designation</Form.Label>
                        <Form.Select
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          required
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={loading}
                      className="d-flex align-items-center"
                    >
                      <FaSave className="me-1" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  <Row className="mb-4">
                    <Col md={6}>
                      <div className="d-flex align-items-center mb-3">
                        <FaUser className="text-muted me-2" />
                        <div>
                          <small className="text-muted d-block">Full Name</small>
                          <strong>{user?.name || 'Not provided'}</strong>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex align-items-center mb-3">
                        <FaEnvelope className="text-muted me-2" />
                        <div>
                          <small className="text-muted d-block">Email Address</small>
                          <strong>{user?.email || 'Not provided'}</strong>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={6}>
                      <div className="d-flex align-items-center mb-3">
                        <FaBuilding className="text-muted me-2" />
                        <div>
                          <small className="text-muted d-block">Faculty</small>
                          <strong>{user?.faculty_name || 'Not specified'}</strong>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex align-items-center mb-3">
                        <FaUniversity className="text-muted me-2" />
                        <div>
                          <small className="text-muted d-block">Department</small>
                          <strong>{user?.department_name || 'Not specified'}</strong>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block">Role</small>
                        <Badge bg={getRoleBadgeColor(user?.role)} className="text-capitalize">
                          {user?.role || 'Not assigned'}
                        </Badge>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block">Designation</small>
                        <Badge bg={getDesignationBadgeColor(user?.designation)} className="text-capitalize">
                          {user?.designation || 'Not specified'}
                        </Badge>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block">Member Since</small>
                        <strong>
                          {user?.created_at 
                            ? new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Unknown'
                          }
                        </strong>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block">Last Updated</small>
                        <strong>
                          {user?.updated_at 
                            ? new Date(user.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Never'
                          }
                        </strong>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
