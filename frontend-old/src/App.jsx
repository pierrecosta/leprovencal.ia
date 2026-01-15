import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DictionaryPage from './pages/DictionaryPage';
import GeographyPage from './pages/GeographyPage';
import HistoryPage from './pages/HistoryPage';
import Login from './pages/LoginPage';
import './App.css';

function App() {
  return (
    <Router>
      {/* Header avec identité provençale */}
      <Header />

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto p-6 bg-bg min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/langue-dictionnaire" element={<DictionaryPage />} />
          <Route path="/geographie" element={<GeographyPage />} />
          <Route path="/histoire-legendes" element={<HistoryPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>

      {/* Footer avec phrase d’accroche */}
      <Footer />
    </Router>
  );
}

export default App;
