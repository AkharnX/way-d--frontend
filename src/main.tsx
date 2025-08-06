import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import applyAllFixes from './utils/apiFixes'

// Applique les correctifs pour les problèmes API (404, 500, discover)
if (process.env.NODE_ENV !== 'test') {
  // Exécuter après chargement complet du DOM pour garantir que toutes les APIs sont disponibles
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      // Patch les fonctions API problématiques
      applyAllFixes();
    }, 500); // Délai de 500ms pour s'assurer que toutes les APIs sont chargées
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
