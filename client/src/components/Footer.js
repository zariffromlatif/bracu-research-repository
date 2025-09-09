import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaGraduationCap, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <Container>
        <Row className="py-5">
          <Col lg={4} md={6} className="mb-4">
            <div className="d-flex align-items-center mb-4">
              <img 
                src="/img/bracu_logo.png" 
                alt="BRACU Logo" 
                height="48" 
                className="me-3"
              />
              <h5 className="mb-0 text-white fw-semibold">BRAC University</h5>
            </div>
            <p className="text-light mb-4">
              A leading private university in Bangladesh, committed to excellence in education, 
              research, and community service.
            </p>
            <div className="d-flex gap-3">
              <a href="https://bracu.ac.bd" target="_blank" rel="noopener noreferrer" className="text-white text-decoration-none">
                <FaGlobe size={18} />
              </a>
              <a href="mailto:info@bracu.ac.bd" className="text-white text-decoration-none">
                <FaEnvelope size={18} />
              </a>
            </div>
          </Col>

          <Col lg={4} md={6} className="mb-4">
            <h6 className="text-white mb-3 fw-semibold">Research Repository</h6>
            <ul className="list-unstyled text-light">
              <li className="mb-2 d-flex align-items-center">
                <FaGraduationCap className="me-2" size={14} />
                Faculty Research Papers
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaGraduationCap className="me-2" size={14} />
                Student Research Projects
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaGraduationCap className="me-2" size={14} />
                Conference Proceedings
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaGraduationCap className="me-2" size={14} />
                Journal Publications
              </li>
            </ul>
          </Col>

          <Col lg={4} md={12}>
            <h6 className="text-white mb-3 fw-semibold">Contact Information</h6>
            <div className="text-light">
              <p className="mb-3 d-flex align-items-start">
                <FaMapMarkerAlt className="me-2 mt-1" size={14} />
                <span>
                  BRAC University<br />
                  66 Mohakhali, Dhaka 1212<br />
                  Bangladesh
                </span>
              </p>
              <p className="mb-3 d-flex align-items-center">
                <FaPhone className="me-2" size={14} />
                +880 2 984 4051-4
              </p>
              <p className="mb-3 d-flex align-items-center">
                <FaEnvelope className="me-2" size={14} />
                info@bracu.ac.bd
              </p>
            </div>
          </Col>
        </Row>

        <hr className="border-secondary opacity-25" />

        <Row className="py-3">
          <Col md={6} className="text-center text-md-start">
            <p className="text-light mb-0 small">
              © {currentYear} BRAC University. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="text-white mb-0 small fw-semibold">
              Research Repository v1.0
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
