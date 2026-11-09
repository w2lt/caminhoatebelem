import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './app/App';
import { requestPersistence } from './db/database';

// Pede armazenamento persistente (reduz o risco de o navegador apagar os dados sozinho).
void requestPersistence();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
