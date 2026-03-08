import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/home">
          <img src="/trzymajsiekocie.png" alt="Trzymaj się kocie logo" className="logo-img" />
        </Link>
      </div>
      <div className="navbar-links">
        <a href="https://www.trzymajsiekocie.com" target="_blank" rel="noopener noreferrer">Trzymajsiekocie</a>
        <Link to="/home">Strona główna</Link>
        <Link to="/chat">Czaty</Link>
      </div>
    </nav>
  );
};

export default Navbar;
