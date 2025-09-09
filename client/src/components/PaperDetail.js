import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaDownload, FaEdit, FaTrash, FaArrowLeft, FaCalendar, FaUser, FaBuilding, FaTag, FaFileAlt, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    fetchPaper();
    fetchVersions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/papers/${id}`);
      setPaper(response.data);
    } catch (error) {
      console.error('Error fetching paper:', error);
      toast.error('Failed to fetch paper details');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await axios.get(`/api/papers/${id}/versions`);
      setVersions(response.data);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this paper? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/papers/${id}`);
        toast.success('Paper deleted successfully');
        navigate('/papers');
      } catch (error) {
        console.error('Error deleting paper:', error);
        toast.error('Failed to delete paper');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status?.toUpperCase() || 'UNKNOWN'}</Badge>;
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

  if (!paper) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Paper Not Found</h4>
          <p>The requested paper could not be found.</p>
          <Link to="/papers" className="btn btn-primary">
            Back to Papers
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Navigation */}
      <Row className="mb-4">
        <Col>
          <Button 
            as={Link} 
            to="/papers" 
            variant="outline-secondary" 
            className="mb-3"
          >
            <FaArrowLeft className="me-2" />
            Back to Papers
          </Button>
        </Col>
      </Row>

      {/* Paper Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="paper-title mb-3">{paper.title}</h1>
              <div className="d-flex align-items-center gap-3 mb-3">
                {getStatusBadge(paper.status)}
                <span className="text-muted">
                  <FaCalendar className="me-1" />
                  Published: {formatDate(paper.publication_date)}
                </span>
                {paper.doi && (
                  <span className="text-muted">
                    DOI: {paper.doi}
                  </span>
                )}
              </div>
            </div>
            
            <div className="d-flex gap-2">
              {paper.file_url && (
                <Button 
                  href={paper.file_url} 
                  variant="primary" 
                  target="_blank"
                >
                  <FaDownload className="me-2" />
                  Download PDF
                </Button>
              )}
              <Button 
                as={Link} 
                to={`/papers/${id}/edit`} 
                variant="outline-primary"
              >
                <FaEdit className="me-2" />
                Edit
              </Button>
              <Button 
                variant="outline-danger" 
                onClick={handleDelete}
              >
                <FaTrash className="me-2" />
                Delete
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Main Content */}
        <Col lg={8}>
          {/* Abstract */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Abstract</h5>
            </Card.Header>
            <Card.Body>
              <p className="paper-abstract">{paper.abstract}</p>
            </Card.Body>
          </Card>

          {/* Keywords */}
          {paper.keywords && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Keywords</h5>
              </Card.Header>
              <Card.Body>
                <div className="paper-keywords">
                  {paper.keywords.split(',').map((keyword, index) => (
                    <Badge key={index} bg="primary" className="me-2 mb-2">
                      {keyword.trim()}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Version History */}
          {versions.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaHistory className="me-2" />
                    Version History
                  </h5>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowVersions(!showVersions)}
                  >
                    {showVersions ? 'Hide' : 'Show'} Versions
                  </Button>
                </div>
              </Card.Header>
              {showVersions && (
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Version</th>
                        <th>Date</th>
                        <th>Changes</th>
                        <th>File</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versions.map((version, index) => (
                        <tr key={version.id}>
                          <td>v{version.version_number}</td>
                          <td>{formatDate(version.created_at)}</td>
                          <td>{version.changes || 'No changes documented'}</td>
                          <td>
                            {version.file_url && (
                              <Button 
                                href={version.file_url} 
                                variant="outline-primary" 
                                size="sm"
                                target="_blank"
                              >
                                <FaDownload className="me-1" />
                                Download
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              )}
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Author Information */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <FaUser className="me-2" />
                Author Information
              </h6>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                <strong>Corresponding Author:</strong><br />
                {paper.corresponding_author || paper.author_name || 'Not specified'}
                {paper.author_email && (
                  <><br /><small className="text-muted">{paper.author_email}</small></>
                )}
              </p>

              {paper.supervisor && (
                <p className="mb-2">
                  <strong>Supervisor:</strong><br />
                  {paper.supervisor}
                </p>
              )}

              {paper.co_supervisor && (
                <p className="mb-2">
                  <strong>Co-Supervisor:</strong><br />
                  {paper.co_supervisor}
                </p>
              )}
              
              {paper.co_authors && paper.co_authors.length > 0 && (
                <div>
                  <strong>Co-authors:</strong>
                  <ul className="list-unstyled mt-2">
                    {paper.co_authors.map((coAuthor, index) => (
                      <li key={index} className="mb-1">
                        {coAuthor.order}. {coAuthor.author_name || coAuthor.co_author_name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Institutional Information */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <FaBuilding className="me-2" />
                Institutional Information
              </h6>
            </Card.Header>
            <Card.Body>
              {paper.department_name && (
                <p className="mb-2">
                  <strong>Department:</strong><br />
                  {paper.department_name}
                </p>
              )}
              
              {paper.faculty_name && (
                <p className="mb-2">
                  <strong>Faculty:</strong><br />
                  {paper.faculty_name}
                </p>
              )}
              
              {paper.category_text && (
                <p className="mb-2">
                  <strong>Research Category:</strong><br />
                  <Badge bg="info">{paper.category_text}</Badge>
                </p>
              )}
            </Card.Body>
          </Card>

          {/* Metadata */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <FaTag className="me-2" />
                Metadata
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="paper-meta">
                <p className="mb-2">
                  <strong>Submission Date:</strong><br />
                  {formatDate(paper.created_at)}
                </p>
                
                {paper.updated_at && (
                  <p className="mb-2">
                    <strong>Last Updated:</strong><br />
                    {formatDate(paper.updated_at)}
                  </p>
                )}
                
                {paper.submission_id && (
                  <p className="mb-2">
                    <strong>Submission ID:</strong><br />
                    {paper.submission_id}
                  </p>
                )}
                
                {paper.reviewer_notes && (
                  <p className="mb-2">
                    <strong>Reviewer Notes:</strong><br />
                    <small className="text-muted">{paper.reviewer_notes}</small>
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  as={Link} 
                  to="/add-paper" 
                  variant="outline-primary"
                >
                  <FaFileAlt className="me-2" />
                  Submit New Paper
                </Button>
                <Button 
                  as={Link} 
                  to="/papers" 
                  variant="outline-secondary"
                >
                  Browse All Papers
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaperDetail;
