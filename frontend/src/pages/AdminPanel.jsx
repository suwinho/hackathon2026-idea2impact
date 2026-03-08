import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    localStorage.getItem('adminToken') === 'true'
  );
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Stan dla panelu zarządzania
  const [cats, setCats] = useState([]);
  const [adoptionForms, setAdoptionForms] = useState([]);
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'remove', or 'forms'
  
  // Stan dla dodawania kota
  const [newCat, setNewCat] = useState({
    imie: '',
    wiek: '',
    charakter: '', // String that we'll split by comma
    opis: '',
    inne_koty: false,
    zdjecie_url: ''
  });

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchCats();
      fetchAdoptionForms();
    }
  }, [isAdminLoggedIn]);

  const fetchCats = async () => {
    try {
      const response = await fetch('/api/cats');
      if (response.ok) {
        const data = await response.json();
        setCats(data);
      }
    } catch (err) {
      console.error('Błąd pobierania kotów:', err);
    }
  };

  const fetchAdoptionForms = async () => {
    try {
      const response = await fetch('/api/forms/adoption');
      if (response.ok) {
        const data = await response.json();
        setAdoptionForms(data);
      }
    } catch (err) {
      console.error('Błąd pobierania formularzy:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        localStorage.setItem('adminToken', 'true');
        setIsAdminLoggedIn(true);
      } else {
        const err = await response.json();
        setLoginError(err.message || 'Błędny login lub hasło');
      }
    } catch (err) {
      setLoginError('Błąd połączenia z serwerem');
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('adminToken');
    setIsAdminLoggedIn(false);
  };

  const handleAddCatSubmit = async (e) => {
    e.preventDefault();
    
    // Przetwarzanie formularza
    const formattedCat = {
      ...newCat,
      wiek: parseInt(newCat.wiek, 10),
      charakter: newCat.charakter.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };

    try {
      const response = await fetch('/api/cats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedCat)
      });

      if (response.ok) {
        alert('Kot został dodany pomyślnie!');
        setNewCat({ imie: '', wiek: '', charakter: '', opis: '', inne_koty: false, zdjecie_url: '' });
        fetchCats();
      } else {
        alert('Błąd podczas dodawania kota.');
      }
    } catch (err) {
      alert('Błąd połączenia z serwerem.');
    }
  };

  const handleRemoveCat = async (id, name) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć kota: ${name}?`)) return;

    try {
      const response = await fetch(`/api/cats/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Usunięto pomyślnie!');
        fetchCats();
      } else {
        alert('Błąd podczas usuwania.');
      }
    } catch (err) {
      alert('Błąd serwera.');
    }
  };

  const handleRemoveForm = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten formularz?')) return;
    try {
      const response = await fetch(`/api/forms/adoption/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Formularz usunięty!');
        fetchAdoptionForms();
      } else {
        alert('Błąd podczas usuwania formularza.');
      }
    } catch (err) {
      alert('Błąd serwera.');
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="admin-login-container">
        <form className="admin-login-form" onSubmit={handleLogin}>
          <h2>Panel Administratora Fundacji</h2>
          <img src="/trzymajsiekocie.png" alt="Logo" className="admin-logo" />
          {loginError && <div className="admin-error">{loginError}</div>}
          
          <input 
            type="text" 
            placeholder="Login" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required
          />
          <input 
            type="password" 
            placeholder="Hasło" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required
          />
          
          <button type="submit" className="admin-submit-btn">Zaloguj się</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h2>Zarządzanie Kotami Fundacji</h2>
        <button onClick={handleLogoutAdmin} className="admin-logout-btn">Wyloguj</button>
      </header>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'add' ? 'active-tab' : ''} 
          onClick={() => setActiveTab('add')}
        >
          Dodaj Kociego Podopiecznego
        </button>
        <button 
          className={activeTab === 'remove' ? 'active-tab' : ''} 
          onClick={() => setActiveTab('remove')}
        >
          Lista / Usuwanie Kotów
        </button>
        <button 
          className={activeTab === 'forms' ? 'active-tab' : ''} 
          onClick={() => { setActiveTab('forms'); fetchAdoptionForms(); }}
        >
          Formularze adopcyjne
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'add' && (
          <form className="admin-add-cat-form" onSubmit={handleAddCatSubmit}>
            <div className="form-group">
              <label>Imię kota</label>
              <input type="text" value={newCat.imie} onChange={e => setNewCat({...newCat, imie: e.target.value})} required />
            </div>
            
            <div className="form-group">
              <label>Wiek (w latach)</label>
              <input type="number" min="0" value={newCat.wiek} onChange={e => setNewCat({...newCat, wiek: e.target.value})} required />
            </div>

            <div className="form-group">
              <label>Charakter (po przecinku np: miły, szybki, groźny)</label>
              <input type="text" value={newCat.charakter} onChange={e => setNewCat({...newCat, charakter: e.target.value})} required />
            </div>

            <div className="form-group">
              <label>Opis</label>
              <textarea value={newCat.opis} onChange={e => setNewCat({...newCat, opis: e.target.value})} required rows="3" />
            </div>

            <div className="form-group checkbox-group">
              <input type="checkbox" id="inneKoty" checked={newCat.inne_koty} onChange={e => setNewCat({...newCat, inne_koty: e.target.checked})} />
              <label htmlFor="inneKoty">Czy toleruje inne koty?</label>
            </div>

            <div className="form-group">
              <label>Zdjecie (Adres URL - opcjonalnie)</label>
              <input type="text" value={newCat.zdjecie_url} onChange={e => setNewCat({...newCat, zdjecie_url: e.target.value})} />
            </div>

            <button type="submit" className="admin-add-btn">Dodaj kota do systemu</button>
          </form>
        )}

        {activeTab === 'remove' && (
          <div className="admin-cat-list">
            {cats.length === 0 ? <p>Brak kotów w bazie.</p> : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Zdjecie</th>
                    <th>Imię</th>
                    <th>Wiek</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {cats.map(cat => (
                    <tr key={cat.id}>
                      <td>{cat.id}</td>
                      <td>
                        <img src={cat.zdjecie_url || 'https://placekitten.com/g/50/50'} alt="cat" width="40" height="40" style={{objectFit:'cover', borderRadius:'50%'}}/>
                      </td>
                      <td>{cat.imie}</td>
                      <td>{cat.wiek} lat</td>
                      <td>
                        <button className="admin-delete-btn" onClick={() => handleRemoveCat(cat.id, cat.imie)}>
                          Usuń profil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="admin-cat-list">
            <h3>Formularze adopcyjne ({adoptionForms.length})</h3>
            {adoptionForms.length === 0 ? <p>Brak formularzów adopcyjnych.</p> : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Typ adopcji</th>
                    <th>Kot</th>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                    <th>Miasto</th>
                    <th>Telefon</th>
                    <th>Odpowiedzi</th>
                    <th>Dopasowanie</th>
                    <th>Data</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {adoptionForms.map(form => (
                    <tr key={form.id}>
                      <td>{form.id}</td>
                      <td><span className={`badge ${form.adoptionType === 'Adopcja sta\u0142a' ? 'badge-green' : 'badge-yellow'}`}>{form.adoptionType}</span></td>
                      <td>{form.catName} (ID: {form.catId})</td>
                      <td>{form.imie || '-'}</td>
                      <td>{form.nazwisko || '-'}</td>
                      <td>{form.miasto || '-'}</td>
                      <td>{form.telefon || '-'}</td>
                      <td className="answers-cell">{form.odpowiedzi || '-'}</td>
                      <td>{form.matchPercentage}%</td>
                      <td>{form.createdAt ? new Date(form.createdAt).toLocaleString('pl-PL') : '-'}</td>
                      <td>
                        <button className="admin-delete-btn" onClick={() => handleRemoveForm(form.id)}>Usuń</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
