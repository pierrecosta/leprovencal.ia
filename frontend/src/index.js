import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Opt-in perf logs (avoid noisy output by default)
if (process.env.REACT_APP_WEB_VITALS === '1') {
  reportWebVitals((metric) => {
    // eslint-disable-next-line no-console
    console.debug('[web-vitals]', metric);
  });
}
