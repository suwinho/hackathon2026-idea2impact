import React, { useState, useEffect, useMemo, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  const [cats, setCats] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showMatch, setShowMatch] = useState(false);
  const [history, setHistory] = useState([]);
  const [swipedCats, setSwipedCats] = useState(new Set());
  const userHasCat = localStorage.getItem('posiadaKota') === 'true';
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const url = userId ? `/api/users/${userId}/discover` : `/api/cats`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const catArray = data; // Backend returns an array directly now

          const filteredCats = catArray.filter(c => {
            if (userHasCat) return c.inne_koty === true;
            return true; 
          });
          setCats(filteredCats);
          setCurrentIndex(filteredCats.length - 1);
        } else {
             if (res.status === 404 && url.includes('discover')) {
               console.warn('Użytkownik nie istnieje w bazie (prawdopodobnie reset). Wylogowywanie...');
               localStorage.removeItem('userId');
               localStorage.removeItem('posiadaKota');
               localStorage.removeItem('matches');
               window.location.href = '/';
               return;
             }

             const fallback = [
              { id: 'mock1', imie: "Biszkopt", wiek: 2, opis: "Biszkopt to kocur, który uwielbia kontakt z człowiekiem. Szuka domu niewychodzącego.", zdjecie_url: "https://trzymajsiekocie.pl/wp-content/uploads/2026/02/image-1.webp", inne_koty: true },
              { id: 'mock2', imie: "Białek", wiek: 1, opis: "Białek to idealny towarzysz dla spokojnych dorosłych kotów. Jest delikatny, nienachalny, ale z radością nawiązuje kocie przyjaźnie.", zdjecie_url: "https://trzymajsiekocie.pl/wp-content/uploads/2025/12/image-29.webp", inne_koty: true },
              { id: 'mock3', imie: "Czesio", wiek: 5, opis: "Czesio to ewidentnie kot skory do zabawy z innymi kotami, Uwielbia głaskanie.", zdjecie_url: "https://trzymajsiekocie.pl/wp-content/uploads/2025/12/image-5-6.webp", inne_koty: true },
              { id: 'mock4', imie: "Kiki", wiek: 3, opis: "Kiki to około roczna kotka, pełna energii i ciekawości świata. Bardzo lubi inne koty – świetnie odnajduje się w kocim towarzystwie i chętnie zaprasza do wspólnych zabaw.", zdjecie_url: "https://trzymajsiekocie.pl/wp-content/uploads/2026/01/image-7.webp", inne_koty: true },
            ].filter(c => userHasCat ? c.inne_koty === true : true);
            setCats(fallback);
            setCurrentIndex(fallback.length - 1);
        }
      } catch (err) {
        console.error(err);
          const fallback = [
              { id: 'mock1', imie: "Biszkopt", wiek: 2, opis: "Biszkopt to kocur, który uwielbia kontakt z człowiekiem. Szuka domu niewychodzącego.", zdjecie_url: "https://trzymajsiekocie.pl/wp-content/uploads/2026/02/image-1.webp", inne_koty: true },
              { id: 'mock2', imie: "Białek", wiek: 1, opis: "Białek to idealny towarzysz dla spokojnych dorosłych kotów. Jest delikatny, nienachalny, ale z radością nawiązuje kocie przyjaźnie.", zdjecie_url: "https://trzymajsiekocie.pl/wp-content/uploads/2025/12/image-29.webp", inne_koty: true },
              { id: 'mock3', imie: "Czesio", wiek: 5, opis: "Czesio to ewidentnie kot skory do zabawy z innymi kotami, Uwielbia głaskanie.", zdjecie_url: "https://trzymajsiekocie.pl/wp-content/uploads/2025/12/image-5-6.webp", inne_koty: true },
              { id: 'mock4', imie: "Kiki", wiek: 3, opis: "Kiki to około roczna kotka, pełna energii i ciekawości świata. Bardzo lubi inne koty – świetnie odnajduje się w kocim towarzystwie i chętnie zaprasza do wspólnych zabaw.", zdjecie_url: "https://trzymajsiekocie.pl/wp-content/uploads/2026/01/image-7.webp", inne_koty: true },
          ].filter(c => userHasCat ? c.inne_koty === true : true);
          setCats(fallback);
          setCurrentIndex(fallback.length - 1);
      }
    };
    fetchCats();
  }, [userHasCat]);

  const childRefs = useMemo(
    () => Array(cats.length).fill(0).map(() => React.createRef()),
    [cats.length]
  );
  
  const canSwipe = useRef(true);

  const handleSwipeButton = (dir) => {
    if (canSwipe.current && currentIndex >= 0 && childRefs[currentIndex]?.current) {
      canSwipe.current = false;
      // Wywołanie animacji natywnej paczki - zero zmian stanu w React podczas lotu!
      childRefs[currentIndex].current.swipe(dir);
    }
  };

  const handleCardLeftScreen = async (direction, cat, index) => {
    // Karta wyleciała poza kadr, można bezpiecznie zaktualizować stan Reacta
    setCurrentIndex(prev => prev - 1);
    canSwipe.current = true;

    // Jak karta wyjdzie poza ekran, oznaczamy ją jako swiped (schowana z DOM, ale ref zostaje)
    setSwipedCats(prev => {
      const newSet = new Set(prev);
      newSet.add(cat.id);
      return newSet;
    });

    // Zapisz w historii by muc użyć "Cofnij"
    setHistory(prev => [...prev, { cat, direction, index }]);

    if (!userId) {
      console.warn("Brak zalogowanego userId w localStorage - działania nie zostaną zapisane w bazie!");
      return;
    }

    if (direction === 'right') {
      setShowMatch(true);
      setTimeout(() => setShowMatch(false), 2000);
      try {
        await fetch(`/api/users/${userId}/match/${cat.id}`, { method: 'POST' });
        console.log(`Match na kotku ${cat.imie} wszedł!`);
      } catch (err) {
        console.error('Błąd match:', err);
      }
    } else if (direction === 'left') {
      try {
        await fetch(`/api/users/${userId}/reject/${cat.id}`, { method: 'POST' });
        console.log(`Odrzucenie kotka ${cat.imie} wpadło!`);
      } catch (err) {
        console.error('Błąd reject:', err);
      }
    }
  };

  const handleUndo = async () => {
    if (history.length === 0) return;

    // Pop the last swiped card from history container
    const newHistory = [...history];
    const lastAction = newHistory.pop();
    setHistory(newHistory);

    // Aktualizujemy główny indeks i pokazujemy z powrotem kartę zanim się "przywróci"
    setCurrentIndex(lastAction.index);
    canSwipe.current = true;
    setSwipedCats(prev => {
      const newSet = new Set(prev);
      newSet.delete(lastAction.cat.id);
      return newSet;
    });

    // Trzeba chwileczkę zaczekać aby DOM objawił kartę z display:block z powrotem by móc odegrać animację wlotu
    setTimeout(async () => {
      if (childRefs[lastAction.index]?.current) {
        await childRefs[lastAction.index].current.restoreCard();
      }
    }, 50);

    // Send undo request to the Backend Database
    if (userId) {
      try {
        const endpoint = lastAction.direction === 'right' ? 'match' : 'reject';
        await fetch(`/api/users/${userId}/${endpoint}/${lastAction.cat.id}`, { method: 'DELETE' });
        console.log(`Cofnięto: ${lastAction.cat.imie}`);
      } catch (err) {
        console.error('Błąd podczas cofania:', err);
      }
    }
  };

  return (
    <div className="home-container">
      <Navbar />
        <div className="card-container">
          {cats.length === 0 && <h2 className="no-cats">Brak kotów spełniających kryteria... 😿</h2>}
          {cats.map((cat, index) => (
            <div key={cat.id} style={{ display: swipedCats.has(cat.id) ? 'none' : 'block' }}>
              <TinderCard 
                ref={childRefs[index]}
                className="swipe" 
                onCardLeftScreen={(dir) => handleCardLeftScreen(dir, cat, index)}
                preventSwipe={['up', 'down']}
              >
                <div className="card" style={{ backgroundImage: 'url(' + (cat.zdjecie_url || 'https://placekitten.com/g/400/600') + ')' }}>
                  <div className="card-info">
                    <h3>{cat.imie || 'Nieznany cat'} <span>{cat.wiek} lat</span></h3>
                    <p>{cat.opis || 'Piękny kociak szukający domu.'}</p>
                  </div>
                </div>
              </TinderCard>
            </div>
          ))}
          
          {cats.length > 0 && (
            <div className="swipe-buttons">
              <button className="swipe-btn reject" onClick={() => handleSwipeButton('left')} aria-label="Odrzuć">
                ✕
              </button>
              <button 
                className="swipe-btn undo" 
                onClick={handleUndo} 
                disabled={history.length === 0} 
                aria-label="Cofnij"
              >
                ↺
              </button>
              <button className="swipe-btn match" onClick={() => handleSwipeButton('right')} aria-label="Zmatchuj">
                ❤️
              </button>
            </div>
          )}

          {showMatch && (
            <div className="match-popup">
              <h2>MATCH! &lt;3</h2>
              <p>Ten mruczek trafił do Twoich chatów!</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default Home;
