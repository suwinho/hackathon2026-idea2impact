import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const userId = localStorage.getItem('userId');
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('posiadaKota');
    localStorage.removeItem('matches');
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to={userId ? "/home" : "/"}>
          <img src="/trzymajsiekocie.png" alt="Trzymaj się kocie logo" className="logo-img" />
        </Link>
      </div>
      <div className="navbar-center">
        <a href="https://www.trzymajsiekocie.com" target="_blank" rel="noopener noreferrer">TrzymajSieKocie</a>
        
        {userId && (
          <>
            <Link to="/home" className={location.pathname === '/home' ? 'active-link' : ''}>Strona główna</Link>
            <Link to="/chat" className={location.pathname === '/chat' ? 'active-link' : ''}>Czaty</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {userId ? (
          <button className="auth-btn logout-btn" onClick={handleLogout}>Wyloguj</button>
        ) : (
          <Link to="/" className="auth-btn login-btn">Zaloguj się</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
