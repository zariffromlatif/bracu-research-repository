import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

const ErrorPage = ({ statusCode, title, message, showSearch = false }) => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} className="text-center">
          <div className="error-content">
            <div className="error-icon mb-4">
              <FaExclamationTriangle size={80} className="text-warning" />
            </div>
            
            <h1 className="error-code mb-3">
              {statusCode}
            </h1>
            
            <h2 className="error-title mb-4">
              {title}
            </h2>
            
            <p className="error-message mb-4 text-muted">
              {message}
            </p>
            
            <div className="error-actions">
              <Button 
                as={Link} 
                to="/" 
                variant="primary" 
                size="lg"
                className="me-3"
              >
                <FaHome className="me-2" />
                Go Home
              </Button>
              
              {showSearch && (
                <Button 
                  as={Link} 
                  to="/papers" 
                  variant="outline-primary" 
                  size="lg"
                >
                  <FaSearch className="me-2" />
                  Browse Papers
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export const NotFound404 = () => (
  <ErrorPage
    statusCode="404"
    title="Page Not Found"
    message="The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL."
    showSearch={true}
  />
);

export const ServerError500 = () => (
  <ErrorPage
    statusCode="500"
    title="Internal Server Error"
    message="Something went wrong on our end. We're working to fix this issue. Please try again later."
    showSearch={true}
  />
);

export const Unauthorized401 = () => (
  <ErrorPage
    statusCode="401"
    title="Unauthorized Access"
    message="You need to be logged in to access this page. Please sign in to continue."
    showSearch={false}
  />
);

export const Forbidden403 = () => (
  <ErrorPage
    statusCode="403"
    title="Access Forbidden"
    message="You don't have permission to access this resource. Please contact an administrator if you believe this is an error."
    showSearch={false}
  />
);

export default ErrorPage;
