import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import WriterDemo from './pages/WriterDemo'
import './index.css'
import { AuthProvider } from './providers/AuthProvider'
import { themeManager } from './design-system/theme/theme-manager'

// Initialize Writer theme on app startup
themeManager.switchTheme('writer').then(() => {
  console.log('Writer theme activated - brutalist digital minimalism for writers');
});

// Check if demo mode is active (via URL query parameter)
const urlParams = new URLSearchParams(window.location.search);
const demoMode = urlParams.get('demo');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {demoMode === 'writer' ? (
      <WriterDemo />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </React.StrictMode>,
)
