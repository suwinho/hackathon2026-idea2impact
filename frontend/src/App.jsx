import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Chat from './pages/Chat';
import SingleChat from './pages/SingleChat';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:cat_id" element={<SingleChat />} />
        <Route path="/admin_panel" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;