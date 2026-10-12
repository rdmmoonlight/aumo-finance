import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { installGlobalErrorHandlers } from './logging/logger';
import { logger } from './services';

installGlobalErrorHandlers(logger);

const container = document.getElementById('root');
if (!container) throw new Error('Elemen #root tidak ditemukan');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
