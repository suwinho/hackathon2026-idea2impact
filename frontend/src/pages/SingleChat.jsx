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

  const handleAdoptionAnswer = (answer) => {
    setShowOptions(false);
    setAdoptionAskMode(false);
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      content: answer ? 'Tak' : 'Nie'
    }]);

    setTimeout(() => {
      if (answer) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'cat',
          type: 'text',
          content: 'To cudownie! 😻 Twoje odpowiedzi zostały przesłane do naszej fundacji. Wkrótce się z Tobą skontaktują. Czekam na Ciebie! ❤️'
        }, {
          id: Date.now() + 2,
          sender: 'cat',
          type: 'link',
          content: 'https://trzymajsiekocie.pl/adopcja/'
        }]);
        submitAdoptionForm('Adopcja stała', lastMatchPercent);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'cat',
          type: 'text',
          content: 'Rozumiem, nic na siłę! 🐾 Jeśli zmienisz zdanie, zawsze tu na Ciebie czekam. Dziękuję za poświęcony czas! ❤️'
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
