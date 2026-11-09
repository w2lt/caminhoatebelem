import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fontes incorporadas (só caracteres latinos; OFL). Ficam no cache offline com o resto do app.
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-700.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/literata/latin-400.css';
import '@fontsource/literata/latin-500.css';
import '@fontsource/literata/latin-400-italic.css';
import '@fontsource/nunito-sans/latin-400.css';
import '@fontsource/nunito-sans/latin-600.css';
import '@fontsource/nunito-sans/latin-700.css';
import '@fontsource/nunito-sans/latin-800.css';
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
