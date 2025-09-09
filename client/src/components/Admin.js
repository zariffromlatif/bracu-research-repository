import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [action, setAction] = useState('');

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    fetchPapers();
  }, [isAdmin, navigate]);

  const fetchPapers = async () => {
    try {
      const response = await fetch('/api/admin/papers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch papers');
      }
      
      const data = await response.json();
      setPapers(data);
    } catch (error) {
      setError('Error fetching papers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paperId, status) => {
    try {
      const response = await fetch(`/api/admin/papers/${paperId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update paper status');
      }

      // Update local state
      setPapers(prev => prev.map(paper => 
        paper.id === paperId 
          ? { ...paper, status, admin_notes: adminNotes }
          : paper
      ));

      setShowModal(false);
      setSelectedPaper(null);
      setAdminNotes('');
      setAction('');
    } catch (error) {
      setError('Error updating paper status: ' + error.message);
    }
  };

  const openModal = (paper, actionType) => {
    setSelectedPaper(paper);
    setAction(actionType);
    setAdminNotes(paper.admin_notes || '');
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold text-primary">
            <FaEye className="me-2" />
            Admin Panel
          </h2>
          <p className="text-muted">Manage research papers and user submissions</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Research Papers Management</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Department</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((paper) => (
                <tr key={paper.id}>
                  <td>
                    <div className="fw-semibold">{paper.title}</div>
                    <small className="text-muted">{paper.keywords}</small>
                  </td>
                  <td>{paper.author_name}</td>
                  <td>{paper.department_name}</td>
                  <td>{getStatusBadge(paper.status)}</td>
                  <td>
                    <small>
                      {new Date(paper.created_at).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      {paper.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => openModal(paper, 'approve')}
                          >
                            <FaCheck />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openModal(paper, 'reject')}
                          >
                            <FaTimes />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/papers/${paper.id}`)}
                      >
                        <FaEye />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {papers.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No papers found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {action === 'approve' ? 'Approve Paper' : 'Reject Paper'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Paper:</strong> {selectedPaper?.title}
          </p>
          <p>
            <strong>Author:</strong> {selectedPaper?.author_name}
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Admin Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this decision..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant={action === 'approve' ? 'success' : 'danger'}
            onClick={() => handleStatusUpdate(
              selectedPaper.id, 
              action === 'approve' ? 'approved' : 'rejected'
            )}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Admin;
