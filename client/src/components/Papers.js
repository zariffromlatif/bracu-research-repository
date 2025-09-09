import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, Spinner, Pagination } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaDownload, FaEye, FaCalendar, FaUser, FaBuilding } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Papers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    department: searchParams.get('department') || '',
    faculty: searchParams.get('faculty') || '',
    year: searchParams.get('year') || '',
    status: searchParams.get('status') || 'all'
  });

  useEffect(() => {
    fetchPapers();
    fetchDepartments();
    fetchFaculties();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        ...filters
      });
      
      const response = await axios.get(`/api/search?${params}`);
      setPapers(response.data.papers || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching papers:', error);
      toast.error('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateSearchParams();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      department: '',
      faculty: '',
      year: '',
      status: 'all'
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    setSearchParams({});
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2000; year--) {
      years.push(year);
    }
    return years;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderPaperCard = (paper) => (
    <Card key={paper.id} className="paper-card mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Badge 
            bg={paper.status === 'approved' ? 'success' : paper.status === 'pending' ? 'warning' : 'danger'}
            className="mb-2"
          >
            {paper.status?.toUpperCase() || 'PENDING'}
          </Badge>
          <small className="text-muted">
            <FaCalendar className="me-1" />
            {formatDate(paper.publication_date)}
          </small>
        </div>

        <h5 className="paper-title">
          <Link to={`/papers/${paper.id}`} className="text-decoration-none">
            {paper.title}
          </Link>
        </h5>

        <p className="paper-author mb-2">
          <FaUser className="me-1" />
          {paper.author_name}
        </p>

        {paper.department_name && (
          <p className="mb-2">
            <FaBuilding className="me-1" />
            {paper.department_name}
            {paper.faculty_name && ` • ${paper.faculty_name}`}
          </p>
        )}

        <p className="paper-abstract mb-3">
          {paper.abstract?.length > 200 
            ? `${paper.abstract.substring(0, 200)}...` 
            : paper.abstract
          }
        </p>

        {paper.keywords && (
          <div className="paper-keywords">
            {paper.keywords.split(',').map((keyword, index) => (
              <Badge key={index} bg="primary" className="me-1">
                {keyword.trim()}
              </Badge>
            ))}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="paper-meta">
            {paper.doi && (
              <span>DOI: {paper.doi}</span>
            )}
            {paper.version && (
              <span>v{paper.version}</span>
            )}
          </div>
          
          <div>
            <Button 
              as={Link} 
              to={`/papers/${paper.id}`} 
              variant="outline-primary" 
              size="sm" 
              className="me-2"
            >
              <FaEye className="me-1" />
              View
            </Button>
            {paper.file_url && (
              <Button 
                href={paper.file_url} 
                variant="outline-success" 
                size="sm"
                target="_blank"
              >
                <FaDownload className="me-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading && papers.length === 0) {
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
      {/* Search and Filters */}
      <div className="search-section mb-4">
        <h2 className="mb-4">Research Papers</h2>
        
        <Form onSubmit={handleSearch}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search papers by title, author, keywords, or abstract..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.faculty}
                onChange={(e) => handleFilterChange('faculty', e.target.value)}
              >
                <option value="">All Faculties</option>
                {faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.name}>
                    {faculty.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                <option value="">All Years</option>
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          
          <Row className="g-3 mt-2">
            <Col md={2}>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button type="submit" variant="primary" className="w-100">
                <FaSearch className="me-1" />
                Search
              </Button>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
                <FaFilter className="me-1" />
                Clear
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Results Count */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="mb-0">
          {papers.length > 0 
            ? `Showing ${papers.length} research paper${papers.length !== 1 ? 's' : ''}`
            : 'No papers found'
          }
        </p>
        <Link to="/add-paper" className="btn btn-primary">
          Submit New Paper
        </Link>
      </div>

      {/* Papers List */}
      {papers.length > 0 ? (
        <>
          <div className="papers-list">
            {papers.map(renderPaperCard)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.First 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum <= totalPages) {
                    return (
                      <Pagination.Item
                        key={pageNum}
                        active={pageNum === currentPage}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Pagination.Item>
                    );
                  }
                  return null;
                })}
                
                <Pagination.Next 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="no-results">
          <h4>No papers found</h4>
          <p className="text-muted">
            Try adjusting your search criteria or browse all papers.
          </p>
          <Button as={Link} to="/papers" variant="primary">
            Browse All Papers
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Papers;
