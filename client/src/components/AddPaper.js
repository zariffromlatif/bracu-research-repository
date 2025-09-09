import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddPaper = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    publication_date: '',
    doi: '',
    category: '',
    department_id: '',
    supervisor: '',
    co_supervisor: '',
    corresponding_author: '',
    co_authors: [],
    file: null,
    additional_notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const deptRes = await axios.get('/api/departments');
      
      setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, file }));
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const addCoAuthor = () => {
    setFormData(prev => ({
      ...prev,
      co_authors: [...prev.co_authors, { name: '', order: prev.co_authors.length + 1 }]
    }));
  };

  const removeCoAuthor = (index) => {
    setFormData(prev => ({
      ...prev,
      co_authors: prev.co_authors.filter((_, i) => i !== index)
    }));
  };

  const updateCoAuthor = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      co_authors: prev.co_authors.map((coAuthor, i) => 
        i === index ? { ...coAuthor, [field]: value } : coAuthor
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.abstract.trim()) {
      newErrors.abstract = 'Abstract is required';
    }

    if (!formData.keywords.trim()) {
      newErrors.keywords = 'Keywords are required';
    }

    if (!formData.publication_date) {
      newErrors.publication_date = 'Publication date is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Department is required';
    }

    if (!formData.corresponding_author.trim()) {
      newErrors.corresponding_author = 'Corresponding author name is required';
    }

    if (!formData.file) {
      newErrors.file = 'PDF file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'co_authors') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'file') {
          submitData.append('file', formData.file);
        } else {
          submitData.append(key, formData[key]);
        }
      });

      await axios.post('/api/papers', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Paper submitted successfully and is pending approval!');
      navigate('/papers');
    } catch (error) {
      console.error('Error submitting paper:', error);
      const message = error.response?.data?.error || 'Failed to submit paper';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="loading-spinner">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">
                <FaUpload className="me-2" />
                Submit Research Paper
              </h3>
            </Card.Header>
            <Card.Body className="p-4">
              <Alert variant="info">
                <strong>Note:</strong> Please ensure all required fields are completed accurately. 
                Your paper will be reviewed by administrators before publication.
              </Alert>

              <Form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <Row className="mb-4">
                  <Col>
                    <h5>Basic Information</h5>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Paper Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        isInvalid={!!errors.title}
                        placeholder="Enter the complete title of your research paper"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.title}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Abstract *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleInputChange}
                        isInvalid={!!errors.abstract}
                        placeholder="Provide a comprehensive abstract of your research (200-500 words)"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.abstract}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Keywords *</Form.Label>
                      <Form.Control
                        type="text"
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleInputChange}
                        isInvalid={!!errors.keywords}
                        placeholder="Enter keywords separated by commas"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.keywords}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Publication Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="publication_date"
                        value={formData.publication_date}
                        onChange={handleInputChange}
                        isInvalid={!!errors.publication_date}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.publication_date}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>DOI (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="doi"
                        value={formData.doi}
                        onChange={handleInputChange}
                        placeholder="Digital Object Identifier"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Research Category *</Form.Label>
                      <Form.Control
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="e.g., AI, Machine Learning, Cyber Security, Data Science"
                        isInvalid={!!errors.category}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Specify the research area/field this paper belongs to
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Institutional Information */}
                <Row className="mb-4">
                  <Col>
                    <h5>Institutional Information</h5>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Supervisor (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="supervisor"
                        value={formData.supervisor}
                        onChange={handleInputChange}
                        placeholder="Enter supervisor's full name"
                        isInvalid={!!errors.supervisor}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.supervisor}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Enter your supervisor's name if applicable
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Co-Supervisor (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="co_supervisor"
                        value={formData.co_supervisor}
                        onChange={handleInputChange}
                        placeholder="Enter co-supervisor's full name"
                        isInvalid={!!errors.co_supervisor}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.co_supervisor}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Enter your co-supervisor's name if applicable
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Department *</Form.Label>
                      <Form.Select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleInputChange}
                        isInvalid={!!errors.department_id}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.department_id}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Author Information */}
                <Row className="mb-4">
                  <Col>
                    <h5>Author Information</h5>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Corresponding Author *</Form.Label>
                      <Form.Control
                        type="text"
                        name="corresponding_author"
                        value={formData.corresponding_author}
                        onChange={handleInputChange}
                        placeholder="Enter your full name as the corresponding author"
                        isInvalid={!!errors.corresponding_author}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.corresponding_author}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Enter your full name as it should appear in the publication
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Co-authors */}
                <Row className="mb-3">
                  <Col>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="mb-0">Co-authors (Optional)</Form.Label>
                      <Button 
                        type="button" 
                        variant="outline-primary" 
                        size="sm"
                        onClick={addCoAuthor}
                      >
                        <FaPlus className="me-1" />
                        Add Co-author
                      </Button>
                    </div>
                    
                    {formData.co_authors.map((coAuthor, index) => (
                      <Row key={index} className="mb-2 g-2">
                        <Col md={8}>
                          <Form.Control
                            type="text"
                            placeholder="Enter co-author full name"
                            value={coAuthor.name}
                            onChange={(e) => updateCoAuthor(index, 'name', e.target.value)}
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Control
                            type="number"
                            placeholder="Order"
                            value={coAuthor.order}
                            onChange={(e) => updateCoAuthor(index, 'order', e.target.value)}
                            min="1"
                          />
                        </Col>
                        <Col md={2}>
                          <Button
                            type="button"
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeCoAuthor(index)}
                          >
                            <FaTrash />
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </Col>
                </Row>

                {/* File Upload */}
                <Row className="mb-4">
                  <Col>
                    <h5>Document Upload</h5>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Research Paper (PDF) *</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        isInvalid={!!errors.file}
                      />
                      <Form.Text className="text-muted">
                        Maximum file size: 10MB. Only PDF files are accepted.
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        {errors.file}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Additional Notes (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="additional_notes"
                        value={formData.additional_notes}
                        onChange={handleInputChange}
                        placeholder="Any additional information or special requests"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Submit Button */}
                <Row className="mt-4">
                  <Col className="text-center">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={submitting}
                      className="px-5"
                    >
                      {submitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Submit Paper
                        </>
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddPaper;
