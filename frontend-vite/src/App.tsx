import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { DictionaryPage } from '@/pages/DictionaryPage';
import { GeographyPage } from '@/pages/GeographyPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { LoginPage } from '@/pages/LoginPage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Header />
        <main className="max-w-6xl mx-auto p-6 bg-bg min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/langue-dictionnaire" element={<DictionaryPage />} />
            <Route path="/geographie" element={<GeographyPage />} />
            <Route path="/histoire-legendes" element={<HistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}
