// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
 
// Register SW
registerSW({
  onOfflineReady() {
    console.log('✅ App is ready for offline use');
  },
  onNeedRefresh() {
    console.log('🔄 New content available, please refresh');
  },
});

console.log('=== APP STARTING ===');
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ SET' : '❌ MISSING');
console.log('SUPABASE_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
        
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);