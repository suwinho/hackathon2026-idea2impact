import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './SingleChat.css';

const STARTING_QUESTIONS = [
  { text: "Cześć! Czy będziesz się ze mną często bawić?", keyword: "energiczny ruchliwy" },
  { text: "A czy będzie Ci przeszkadzać, jeżeli będę drapać meble?", keyword: "drapie meble" },
  { text: "Czy w przyszłości będę mieć kociego kolegę?", keyword: "towarzyski kocie przyjaźnie" },
  { text: "Czy masz dla mnie dużo czasu?", keyword: "lubi pieszczoty dużo czasu kontakt z człowiekiem" }
];

const SingleChat = () => {
  const { cat_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [cat, setCat] = useState(location.state?.cat || null);
  const [messages, setMessages] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  
  // States for survey
  const [surveyMode, setSurveyMode] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState([]);
  const [adoptionAskMode, setAdoptionAskMode] = useState(false);
  const [lastMatchPercent, setLastMatchPercent] = useState(0);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // If we don't have the cat from state (e.g. user refreshed the page), fetch it
    if (!cat) {
      fetchCatsAndFind();
    } else {
      initChat(cat);
    }
  }, []);

  const fetchCatsAndFind = async () => {
    try {
      const res = await fetch('/api/cats');
      if (res.ok) {
        const cats = await res.json();
        const found = cats.find(c => c.id.toString() === cat_id);
        if (found) {
          setCat(found);
          initChat(found);
        } else {
          // If cat not found, go back to chats
          navigate('/chat');
        }
      }
    } catch (err) {
      console.error('Error fetching cats', err);
    }
  };

  const initChat = (catData) => {
    // Check if we already initialized to avoid duplicate messages on strict mode
    if (messages.length > 0) return;
    
    // Initial cat message
    setMessages([
      {
        id: 1,
        sender: 'cat',
        type: 'image',
        content: catData.zdjecie_url || 'https://placekitten.com/g/200/200'
      },
      {
        id: 2,
        sender: 'cat',
        type: 'text',
        content: `Cześć jestem ${catData.imie}, jak chciałbyś się mną zaopiekować?`
      }
    ]);
    
    // Show user options after a short delay to simulate typing/sending
    setTimeout(() => {
      setShowOptions(true);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showOptions]);

  const handleOptionSelect = (option) => {
    setShowOptions(false);
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      content: option
    }]);

    if (option === 'Adopcja wirtualna') {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'cat',
          type: 'text',
          content: 'Ojej, to wspaniale! Bardzo się cieszę, że chcesz zostać moim wirtualnym opiekunem 😻 Tutaj znajdziesz wszystkie szczegóły: '
        }, {
          id: Date.now() + 2,
          sender: 'cat',
          type: 'link',
          content: 'https://trzymajsiekocie.pl/adopcja-wirtualna/'
        }, {
          id: Date.now() + 3,
          sender: 'cat',
          type: 'text',
          content: 'Dziękuję za Twoją pomoc! ❤️'
        }]);
        setChatEnded(true);
      }, 1500);
    } else if (option === 'Adopcja stała') {
      // Rozpocznij ankietę
      setTimeout(() => {
        setSurveyMode(true);
        askSurveyQuestion(0);
      }, 1000);
    } else if (option === 'Dom tymczasowy') {
      setTimeout(() => {
         setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'cat',
            type: 'text',
            content: `Super! Mój wolontariusz wkrótce się z Tobą skontaktuje w sprawie domu tymczasowego. Miau! 🐾`
         }]);
         setChatEnded(true);
         submitAdoptionForm('Dom tymczasowy', null);
      }, 1500);
    }
  };

  const askSurveyQuestion = (stepIndex) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'cat',
      type: 'text',
      content: STARTING_QUESTIONS[stepIndex].text
    }]);
    setShowOptions(true);
  };

  const handleSurveyAnswer = (answerBool) => {
    setShowOptions(false);
    
    // Zapisz odpowiedź do UI (Tak/Nie)
    const textAnswer = answerBool ? 'Tak' : 'Nie';
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      content: textAnswer
    }]);

    // Zapisz odpowiedź do cache
    const newAnswers = [...surveyAnswers, { index_pytania: surveyStep, odpowiedz: answerBool }];
    setSurveyAnswers(newAnswers);

    const nextStep = surveyStep + 1;
    if (nextStep < STARTING_QUESTIONS.length) {
      setSurveyStep(nextStep);
      setTimeout(() => {
        askSurveyQuestion(nextStep);
      }, 1000);
    } else {
      // Koniec pytań
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'cat',
          type: 'text',
          content: 'Dziękuję za wszystkie odpowiedzi! Twoje preferencje zostały przeanalizowane. 😺'
        }]);
        sendSurveyData(newAnswers);
      }, 1000);
    }
  };

  const sendSurveyData = async (answersPayload) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await fetch('/api_py/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          cat_id: parseInt(cat_id, 10),
          odpowiedzi: answersPayload
            .filter(a => a.odpowiedz)
            .map(a => STARTING_QUESTIONS[a.index_pytania].keyword)
            .join(' ')
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const matchPercent = data.match_percentage || 0;
        setLastMatchPercent(matchPercent);
        
        // Show the match percentage in the chat
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'cat',
            type: 'text',
            content: `Nasze dopasowanie wynosi: ${matchPercent}%! 🐾`
          }]);
          // Ask adoption question after showing match
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now() + 1,
              sender: 'cat',
              type: 'text',
              content: `Czy rozważasz moją adopcję? 🥺❤️`
            }]);
            setSurveyMode(false);
            setAdoptionAskMode(true);
            setChatEnded(false);
            setShowOptions(true);
          }, 2000);
        }, 1500);
      } else {
        console.error('Błąd z backendu AI:', response.status);
      }
    } catch (err) {
      console.error('Błąd wysyłania wyników ankiety na AI backend:', err);
    }
  };

  const submitAdoptionForm = async (adoptionType, matchPercent) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      // Fetch user details from backend
      const userRes = await fetch(`/api/users/${userId}`);
      let userData = {};
      if (userRes.ok) {
        const user = await userRes.json();
        userData = user.userData || {};
      }

      const odpowiedziStr = surveyAnswers
        .map((a, idx) => `${STARTING_QUESTIONS[idx]?.text || `Pytanie ${idx}`}: ${a.odpowiedz ? 'Tak' : 'Nie'}`)
        .join('; ');

      const formData = {
        userId: parseInt(userId, 10),
        catId: parseInt(cat_id, 10),
        catName: cat?.imie || '',
        adoptionType: adoptionType,
        imie: userData.imie || '',
        nazwisko: userData.nazwisko || '',
        email: '',
        telefon: userData.telefon || '',
        miasto: userData.miasto || '',
        rodzajLokum: userData.rodzajLokum || '',
        odpowiedzi: odpowiedziStr,
        matchPercentage: matchPercent || 0
      };

      await fetch('/api/forms/adoption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (err) {
      console.error('Błąd wysyłania formularza adopcji:', err);
    }
  };

  const generateAdoptionImage = (catData, matchPercent) => {
    return new Promise((resolve) => {
      const W = 400, H = 476;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, W, H);
      gradient.addColorStop(0, '#7BD4F7');
      gradient.addColorStop(0.5, '#a8e6ff');
      gradient.addColorStop(1, '#7BD4F7');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);

      // White card
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      const cardX = 16, cardY = 12, cardW = W - 32, cardH = H - 24, cardR = 16;
      ctx.beginPath();
      ctx.moveTo(cardX + cardR, cardY);
      ctx.lineTo(cardX + cardW - cardR, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + cardR);
      ctx.lineTo(cardX + cardW, cardY + cardH - cardR);
      ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - cardR, cardY + cardH);
      ctx.lineTo(cardX + cardR, cardY + cardH);
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - cardR);
      ctx.lineTo(cardX, cardY + cardR);
      ctx.quadraticCurveTo(cardX, cardY, cardX + cardR, cardY);
      ctx.closePath();
      ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      const drawTexts = () => {
        // Cat name
        ctx.fillStyle = '#333'; ctx.font = 'bold 22px Arial, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(catData.imie || 'Kotek', W / 2, 230);

        // "znalazłem dom!" text
        ctx.fillStyle = '#2ed573'; ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText('Ktoś chce mnie adoptować! ❤', W / 2, 260);

        // Match percentage
        ctx.fillStyle = '#7BD4F7'; ctx.font = 'bold 18px Arial, sans-serif';
        ctx.fillText(`Dopasowanie: ${matchPercent}%`, W / 2, 285);
      };

      let imagesLoaded = 0;
      const totalImages = 3;
      const checkDone = () => {
        imagesLoaded++;
        if (imagesLoaded >= totalImages) {
          resolve(canvas.toDataURL('image/png'));
        }
      };

      // Load cat photo via fetch->blob to avoid CORS tainted canvas
      const originalCatUrl = catData.zdjecie_url || 'https://placekitten.com/g/200/200';
      // Use corsproxy to bypass strict CORS blocking from original domains
      const catUrl = `https://corsproxy.io/?${encodeURIComponent(originalCatUrl)}`;
      
      fetch(catUrl)
        .then(res => res.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const catImg = new Image();
          catImg.onload = () => {
            const cx = W / 2, cy = 130, cr = 70;
            ctx.save();
            ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
            const aspect = catImg.width / catImg.height;
            let sx = 0, sy = 0, sw = catImg.width, sh = catImg.height;
            if (aspect > 1) { sx = (catImg.width - catImg.height) / 2; sw = catImg.height; }
            else { sy = (catImg.height - catImg.width) / 2; sh = catImg.width; }
            ctx.drawImage(catImg, sx, sy, sw, sh, cx - cr, cy - cr, cr * 2, cr * 2);
            ctx.restore();
            ctx.strokeStyle = '#7BD4F7'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(cx, cy, cr + 2, 0, Math.PI * 2); ctx.stroke();
            drawTexts();
            URL.revokeObjectURL(blobUrl);
            checkDone();
          };
          catImg.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            ctx.fillStyle = '#eee';
            ctx.beginPath(); ctx.arc(W / 2, 130, 70, 0, Math.PI * 2); ctx.fill();
            drawTexts();
            checkDone();
          };
          catImg.src = blobUrl;
        })
        .catch(() => {
          ctx.fillStyle = '#eee';
          ctx.beginPath(); ctx.arc(W / 2, 130, 70, 0, Math.PI * 2); ctx.fill();
          drawTexts();
          checkDone();
        });

      // Load logo (top-left)
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        const lw = 60, lh = (logoImg.height / logoImg.width) * lw;
        ctx.drawImage(logoImg, W - lw - 24, 20, lw, lh);
        checkDone();
      };
      logoImg.onerror = () => {
        ctx.fillStyle = '#333'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'right';
        ctx.fillText('TrzymajSięKocie', W - 24, 40);
        checkDone();
      };
      logoImg.src = '/trzymajsiekocie.png';

      // Load QR code (bottom area)
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        const qrSize = 130;
        ctx.drawImage(qrImg, W / 2 - qrSize / 2, 305, qrSize, qrSize);
        ctx.fillStyle = '#888'; ctx.font = '11px Arial'; ctx.textAlign = 'center';
        ctx.fillText('Zeskanuj i pomóż!', W / 2, 450);
        checkDone();
      };
      qrImg.onerror = checkDone;
      qrImg.src = '/TrzymajSieKocieQR.jpeg';
    });
  };

  const handleAdoptionAnswer = (answer) => {
    setShowOptions(false);
    setAdoptionAskMode(false);
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      content: answer ? 'Tak' : 'Nie'
    }]);

    setTimeout(async () => {
      if (answer) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'cat',
          type: 'text',
          content: 'To cudownie! \ud83d\ude3b Twoje odpowiedzi zosta\u0142y przes\u0142ane do naszej fundacji. Wkr\u00f3tce si\u0119 z Tob\u0105 skontaktuj\u0105. Czekam na Ciebie! \u2764\ufe0f'
        }, {
          id: Date.now() + 2,
          sender: 'cat',
          type: 'link',
          content: 'https://trzymajsiekocie.pl/adopcja/'
        }]);
        submitAdoptionForm('Adopcja sta\u0142a', lastMatchPercent);

        // Generate and display the adoption share image
        try {
          const imageDataUrl = await generateAdoptionImage(cat, lastMatchPercent);
          setMessages(prev => [...prev, {
            id: Date.now() + 3,
            sender: 'cat',
            type: 'text',
            content: 'Podziel si\u0119 t\u0105 wspania\u0142\u0105 wiadomo\u015bci\u0105! \ud83c\udf89'
          }, {
            id: Date.now() + 4,
            sender: 'cat',
            type: 'adoption-image',
            content: imageDataUrl
          }]);
        } catch (err) {
          console.error('B\u0142\u0105d generowania obrazka adopcji:', err);
        }
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'cat',
          type: 'text',
          content: 'Rozumiem, nic na si\u0142\u0119! \ud83d\udc3e Je\u015bli zmienisz zdanie, zawsze tu na Ciebie czekam. Dzi\u0119kuj\u0119 za po\u015bwi\u0119cony czas! \u2764\ufe0f'
        }]);
      }
      setChatEnded(true);
    }, 1000);
  };

  if (!cat) return <div className="loading-chat">Ładowanie...</div>;

  return (
    <div className="single-chat-page">
      <Navbar />
      <div className="single-chat-container">
        <div className="chat-window-header">
          <img src={cat.zdjecie_url || 'https://placekitten.com/g/50/50'} alt={cat.imie} className="chat-avatar" />
          <h2>{cat.imie}</h2>
          <button className="back-to-chats" onClick={() => navigate('/chat')}>Wróć do czatów</button>
        </div>
        
        <div className="chat-messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender === 'user' ? 'message-right' : 'message-left'}`}>
              {msg.sender === 'cat' && (
                 <img src={cat.zdjecie_url || 'https://placekitten.com/g/50/50'} alt={cat.imie} className="msg-avatar" />
              )}
              <div className={`message-bubble ${msg.sender}`}>
                {msg.type === 'text' && <p>{msg.content}</p>}
                {msg.type === 'image' && <img src={msg.content} alt="Cat sent" className="chat-img-attachment" />}
                {msg.type === 'link' && <a href={msg.content} target="_blank" rel="noopener noreferrer" className="chat-link">{msg.content}</a>}
                {msg.type === 'adoption-image' && (
                  <div className="adoption-share-image">
                    <img src={msg.content} alt="Adopcja" style={{width: '100%', borderRadius: '12px'}} />
                    <a href={msg.content} download={`adopcja_${cat?.imie || 'kot'}.png`} className="download-share-btn">
                      📥 Pobierz i udostępnij
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {showOptions && !chatEnded && (
          <div className="chat-options-area">
            {adoptionAskMode ? (
              <>
                <button onClick={() => handleAdoptionAnswer(true)} className="chat-option-btn" style={{backgroundColor: '#e6f9ed', borderColor: '#2ed573'}}>Tak, chcę adoptować! 😻</button>
                <button onClick={() => handleAdoptionAnswer(false)} className="chat-option-btn" style={{backgroundColor: '#ffeaa7', borderColor: '#ffa502'}}>Nie, jeszcze nie teraz</button>
              </>
            ) : surveyMode ? (
              <>
                <button onClick={() => handleSurveyAnswer(true)} className="chat-option-btn" style={{backgroundColor: '#e6f9ed', borderColor: '#2ed573'}}>Tak</button>
                <button onClick={() => handleSurveyAnswer(false)} className="chat-option-btn" style={{backgroundColor: '#ffeaa7', borderColor: '#ffa502'}}>Nie</button>
              </>
            ) : (
              <>
                <button onClick={() => handleOptionSelect('Adopcja wirtualna')} className="chat-option-btn">Adopcja wirtualna</button>
                <button onClick={() => handleOptionSelect('Dom tymczasowy')} className="chat-option-btn">Dom tymczasowy</button>
                <button onClick={() => handleOptionSelect('Adopcja stała')} className="chat-option-btn">Adopcja stała</button>
              </>
            )}
          </div>
        )}
        
        {chatEnded && (
          <div className="chat-ended-alert">
            Kociak zakończył konwersację.
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleChat;
