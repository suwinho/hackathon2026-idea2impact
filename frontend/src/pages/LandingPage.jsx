import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function LandingPage() {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authView, setAuthView] = useState('options'); // 'options', 'login', 'register'
  const navigate = useNavigate();

  // Input states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    imie: '', nazwisko: '', dataUrodzenia: '', 
    email: '', password: '', telefon: '', miasto: '', rodzajLokum: '',
    posiadaKota: 'nie'
  });

  useEffect(() => {
    // Reveal popup immediately when component mounts
    setShowWelcomePopup(true);
  }, []);

  const handleStartAdoption = () => {
    setShowWelcomePopup(false);
    setShowAuthPopup(true);
    setAuthView('options');
  };

  const handleCloseAuth = () => {
    setShowAuthPopup(false);
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST to /api/users/login
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          alert('Błędny email lub hasło.');
        } else {
          alert('Błąd logowania!');
        }
        return;
      }

      const data = await response.json();
      localStorage.setItem('userId', data.id);
      
      console.log('Login successful:', data);
      alert('Zalogowano pomyślnie! Przekierowujemy do strony głównej...');
      handleCloseAuth();
      navigate('/home');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Nie udało się połączyć z serwerem.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create payload with boolean mapping for inny_kot
      const payload = {
        ...registerData,
        inny_kot: registerData.posiadaKota === 'tak'
      };

      // POST to /api/forms
      const response = await fetch('/api/forms/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || "Błąd rejestracji!");
        return;
      }
      
      localStorage.setItem('userId', data.id);
      // Save their preference locally so Home screen can filter quickly
      localStorage.setItem('posiadaKota', payload.inny_kot ? 'true' : 'false');
      
      console.log('Registration submitted:', data);
      alert("Konto zostało pomyślnie założone!");
      handleCloseAuth();
      navigate('/home');
    } catch (error) {
      console.error('Error registering:', error);
      alert("Nie udało się połączyć z serwerem.");
    }
  };

  return (
    <div className="app-container">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Znajdź swojego mruczącego przyjaciela</h1>
          <p>Adopcja kotów i domy tymczasowe - daj im szansę na miłość.</p>
        </div>
      </header>

      {/* Welcome Popup Overlay */}
      {showWelcomePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2 className="popup-title">Hej Kocie 👋</h2>
            <p className="popup-text">
              Witaj w miejscu, gdzie każdy mruczek zasługuje na kochający dom. 
              Czy jesteś gotowy, by otworzyć swoje serce i dołączyć do naszej kociej rodziny?
            </p>
            <button className="popup-button" onClick={handleStartAdoption}>
              Przejdź do adopcji
            </button>
          </div>
        </div>
      )}

      {/* Auth Popup Overlay */}
      {showAuthPopup && (
        <div className="popup-overlay">
          <div className="popup-content auth-popup">
            <button className="close-button" onClick={handleCloseAuth} aria-label="Zamknij">
              ×
            </button>
            
            {authView === 'options' && (
              <>
                <h2 className="popup-title">Dołącz do nas 🐾</h2>
                <p className="popup-text">
                  Aby kontynuować proces adopcji, prosimy o zalogowanie się lub założenie nowego konta.
                </p>
                <div className="auth-buttons-container">
                  <button className="popup-button login-btn" onClick={() => setAuthView('login')}>
                    Zaloguj się
                  </button>
                  <button className="popup-button register-btn" onClick={() => setAuthView('register')}>
                    Daj się poznać kotom
                  </button>
                </div>
              </>
            )}

            {authView === 'login' && (
              <>
                <button className="back-button" onClick={() => setAuthView('options')} aria-label="Wróć">
                  ←
                </button>
                <h2 className="popup-title">Zaloguj się 🐾</h2>
                <form className="auth-form" onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required 
                      placeholder="twój@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Hasło</label>
                    <input 
                      type="password" 
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required 
                      placeholder="••••••••"
                    />
                  </div>
                  <button type="submit" className="popup-button submit-btn">
                    Zaloguj się
                  </button>
                </form>
              </>
            )}

            {authView === 'register' && (
              <>
                <button className="back-button" onClick={() => setAuthView('options')} aria-label="Wróć">
                  ←
                </button>
                <h2 className="popup-title">Poznajmy się 🐾</h2>
                <form className="auth-form register-form" onSubmit={handleRegisterSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Imię</label>
                      <input type="text" name="imie" value={registerData.imie} onChange={handleRegisterChange} required />
                    </div>
                    <div className="form-group">
                      <label>Nazwisko</label>
                      <input type="text" name="nazwisko" value={registerData.nazwisko} onChange={handleRegisterChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Data urodzenia</label>
                    <input type="date" name="dataUrodzenia" value={registerData.dataUrodzenia} onChange={handleRegisterChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} required />
                  </div>
                  <div className="form-group">
                    <label>Hasło</label>
                    <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} required />
                  </div>
                  <div className="form-group">
                    <label>Nr. telefonu</label>
                    <input type="tel" name="telefon" value={registerData.telefon} onChange={handleRegisterChange} required />
                  </div>
                  <div className="form-group">
                    <label>Miasto zamieszkania</label>
                    <input type="text" name="miasto" value={registerData.miasto} onChange={handleRegisterChange} required />
                  </div>
                  
                  {/* NEW RADIO FIELD */}
                  <div className="form-group form-radio-group">
                    <label>Czy masz w domu kota?</label>
                    <div className="radio-options">
                      <label className="radio-label">
                        <input type="radio" name="posiadaKota" value="tak" checked={registerData.posiadaKota === 'tak'} onChange={handleRegisterChange} required /> Tak
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="posiadaKota" value="nie" checked={registerData.posiadaKota === 'nie'} onChange={handleRegisterChange} required /> Nie
                      </label>
                    </div>
                  </div>

                  <div className="form-group form-radio-group">
                    <label>Rodzaj lokum</label>
                    <div className="radio-options">
                      <label className="radio-label">
                        <input type="radio" name="rodzajLokum" value="dom" checked={registerData.rodzajLokum === 'dom'} onChange={handleRegisterChange} required /> Dom
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="rodzajLokum" value="mieszkanie" checked={registerData.rodzajLokum === 'mieszkanie'} onChange={handleRegisterChange} required /> Mieszkanie
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="popup-button submit-btn register-submit">
                    Zarejestruj się
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
