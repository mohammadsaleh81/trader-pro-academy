import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Font loading helper to prevent FOUT (Flash of Unstyled Text)
const ensureFontsLoaded = async () => {
  if ('fonts' in document) {
    try {
      await document.fonts.load('400 16px Vazirmatn');
      await document.fonts.load('700 16px Vazirmatn');
      console.log('✅ Fonts loaded successfully');
    } catch (error) {
      console.warn('⚠️ Font loading failed, using fallback:', error);
    }
  }
};

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

// Ensure fonts are loaded before rendering
ensureFontsLoaded().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch(() => {
  // Render anyway if font loading fails
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
