import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Añadir un log para depuración
console.log('Inicializando aplicación Cumple...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('No se pudo encontrar el elemento "root" en el DOM');
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('Aplicación Cumple inicializada correctamente');
  } catch (error) {
    console.error('Error al renderizar la aplicación:', error);
  }
}
