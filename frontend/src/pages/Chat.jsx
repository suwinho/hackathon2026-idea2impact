import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Chat.css';

const Chat = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.warn('Brak userId, nie można pobrać dopasowań.');
        return;
      }
      try {
        const res = await fetch(`/api/users/${userId}/match`);
        if (res.ok) {
          const data = await res.json();
          setMatches(data);
        }
      } catch (err) {
        console.error('Błąd podczas pobierania matchy z backendu:', err);
      }
    };
    
    fetchMatches();
  }, []);

  const clearMatches = () => {
    localStorage.removeItem('matches');
    setMatches([]);
  };

  return (
    <div className="chat-container">
      <Navbar />
      <div className="chat-content">
        <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>Twoje adopcyjne pary 🐾</h1>
        </div>
        {matches.length === 0 ? (
          <p className="no-matches">Jeszcze nie dopasowałeś żadnego mruczka. Wróć do strony głównej i machnij w prawo!</p>
        ) : (
          <div className="matches-grid">
            {matches.map(cat => (
              <div key={cat.id} className="match-card">
                <img src={cat.zdjecie_url || 'https://placekitten.com/g/200/200'} alt={cat.imie} />
                <div className="match-details">
                  <h3>{cat.imie}</h3>
                  <Link to={`/chat/${cat.id}`} state={{ cat }} style={{ textDecoration: 'none' }}>
                    <button className="chat-btn">Rozpocznij konwersację</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
