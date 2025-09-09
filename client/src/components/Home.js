import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaGraduationCap, FaUsers, FaChartBar, FaFileAlt, FaUniversity, FaBookOpen, FaAward, FaGlobe } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, isAuthor } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [stats, setStats] = useState({
    papers: 0,
    authors: 0,
    departments: 0,
    years: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to papers page with search query
      window.location.href = `/papers?search=${encodeURIComponent(searchQuery)}&type=${searchType}`;
    }
  };

  const features = [
    {
      icon: <FaFileAlt size={40} className="text-primary" />,
      title: 'Paper Submission',
      description: 'Submit research papers with comprehensive metadata including title, abstract, keywords, and PDF files.',
      color: 'primary'
    },
    {
      icon: <FaSearch size={40} className="text-success" />,
      title: 'Advanced Search',
      description: 'Search papers by title, author, department, category, or publication year with advanced filtering options.',
      color: 'success'
    },
    {
      icon: <FaUsers size={40} className="text-info" />,
      title: 'Author Management',
      description: 'Manage multiple co-authors with defined order and corresponding author identification.',
      color: 'info'
    },
    {
      icon: <FaChartBar size={40} className="text-warning" />,
      title: 'Analytics & Reports',
      description: 'Generate comprehensive reports on research trends, productivity, and publication statistics.',
      color: 'warning'
    }
  ];

  const statsDisplay = [
    { 
      number: loadingStats ? '...' : stats.papers, 
      label: 'Research Papers', 
      icon: <FaBookOpen />, 
      color: 'primary' 
    },
    { 
      number: loadingStats ? '...' : stats.authors, 
      label: 'Authors', 
      icon: <FaUsers />, 
      color: 'success' 
    },
    { 
      number: loadingStats ? '...' : stats.departments, 
      label: 'Departments', 
      icon: <FaUniversity />, 
      color: 'info' 
    },
    { 
      number: loadingStats ? '...' : `${stats.years}+`, 
      label: 'Years of Excellence', 
      icon: <FaAward />, 
      color: 'warning' 
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              <div className="hero-content">
                <div className="hero-badge mb-3">
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    <FaGlobe className="me-2" />
                    BRAC University Research Platform
                  </Badge>
                </div>
                
                <h1 className="hero-title">
                  Discover & Share
                  <span className="text-gradient"> Research Excellence</span>
                </h1>
                
                <p className="hero-description">
                  A centralized digital platform for storing, managing, and discovering research papers 
                  authored by BRAC University faculty members and students. Join our academic community 
                  in advancing knowledge and innovation.
                </p>
                
                {/* Search Form */}
                <div className="search-section">
                  <Form onSubmit={handleSearch}>
                    <Row className="g-3">
                                            <Col md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Search papers, authors, or keywords..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          size="lg"
                          className="search-input"
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Select
                          value={searchType}
                          onChange={(e) => setSearchType(e.target.value)}
                          size="lg"
                          className="search-select"
                        >
                          <option value="title">Title</option>
                          <option value="author">Author</option>
                          <option value="keywords">Keywords</option>
                          <option value="abstract">Abstract</option>
                        </Form.Select>
                      </Col>
                      <Col md={2}>
                        <Button 
                          type="submit" 
                          variant="primary" 
                          size="lg" 
                          className="search-button w-100"
                        >
                          <FaSearch />
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>

                <div className="hero-actions mt-4">
                  <Button 
                    as={Link} 
                    to="/papers" 
                    variant="outline-light" 
                    size="lg"
                    className="me-3"
                  >
                    <FaBookOpen className="me-2" />
                    Browse Papers
                  </Button>
                  {!isAuthenticated() ? (
                    <Button 
                      as={Link} 
                      to="/login" 
                      variant="light" 
                      size="lg"
                    >
                      <FaGraduationCap className="me-2" />
                      Get Started
                    </Button>
                  ) : isAuthor() ? (
                    <Button 
                      as={Link} 
                      to="/add-paper" 
                      variant="light" 
                      size="lg"
                    >
                      <FaFileAlt className="me-2" />
                      Submit Paper
                    </Button>
                  ) : (
                    <Button 
                      as={Link} 
                      to="/admin" 
                      variant="light" 
                      size="lg"
                    >
                      <FaGraduationCap className="me-2" />
                      Admin Panel
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <Container>
          <Row className="g-4">
            {statsDisplay.map((stat, index) => (
              <Col key={index} md={3} sm={6}>
                <Card className="stat-card h-100 border-0 shadow-sm">
                  <Card.Body className="text-center p-4">
                    <div className={`stat-icon mb-3 text-${stat.color}`}>
                      {stat.icon}
                    </div>
                    <h3 className="stat-number mb-2">{stat.number}</h3>
                    <p className="stat-label text-muted mb-0">{stat.label}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 className="section-title">
                Powerful Features for
                <span className="text-gradient"> Research Excellence</span>
              </h2>
              <p className="section-subtitle">
                Our platform provides comprehensive tools and features to support your research journey
              </p>
            </Col>
          </Row>
          
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col key={index} lg={6} xl={3}>
                <Card className="feature-card h-100 border-0 shadow-sm">
                  <Card.Body className="p-4 text-center">
                    <div className="feature-icon-wrapper mb-4">
                      {feature.icon}
                    </div>
                    <h4 className="feature-title mb-3">{feature.title}</h4>
                    <p className="feature-description text-muted mb-0">
                      {feature.description}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="cta-content">
                <h2 className="cta-title mb-4">
                  {isAuthenticated() && isAuthor() ? (
                    <>
                      Ready to Contribute to
                      <span className="text-gradient"> Academic Excellence</span>?
                    </>
                  ) : (
                    <>
                      Explore 
                      <span className="text-gradient"> Academic Excellence</span>
                    </>
                  )}
                </h2>
                <p className="cta-description mb-4">
                  {isAuthenticated() && isAuthor() ? (
                    "Join our research community and share your knowledge with the world. Submit your research papers and be part of BRAC University's academic legacy."
                  ) : (
                    "Explore our comprehensive collection of research papers from BRAC University faculty and students. Discover knowledge and innovation across various academic disciplines."
                  )}
                </p>
                <div className="cta-buttons">
                  {isAuthenticated() && isAuthor() && (
                    <Button 
                      as={Link} 
                      to="/add-paper" 
                      variant="primary" 
                      size="lg"
                      className="me-3"
                    >
                      <FaFileAlt className="me-2" />
                      Submit Paper
                    </Button>
                  )}
                  <Button 
                    as={Link} 
                    to="/papers" 
                    variant="dark" 
                    size="lg"
                  >
                    <FaSearch className="me-2" />
                    Explore Papers
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
