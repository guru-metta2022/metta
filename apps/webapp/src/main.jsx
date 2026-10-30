import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastDialogProvider } from './components/ToastDialogContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastDialogProvider>
      <App />
    </ToastDialogProvider>
  </React.StrictMode>
);
