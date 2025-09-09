import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Papers from './components/Papers';
import PaperDetail from './components/PaperDetail';
import AddPaper from './components/AddPaper';
import Login from './components/Login';
import Admin from './components/Admin';
import Profile from './components/Profile';
import Footer from './components/Footer';
import { NotFound404, ServerError500, Unauthorized401, Forbidden403 } from './components/ErrorPages';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/papers" element={<Papers />} />
              <Route path="/papers/:id" element={<PaperDetail />} />
              <Route path="/add-paper" element={<AddPaper />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/error/401" element={<Unauthorized401 />} />
              <Route path="/error/403" element={<Forbidden403 />} />
              <Route path="/error/500" element={<ServerError500 />} />
              <Route path="*" element={<NotFound404 />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
