import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './providers/AuthProvider'
import { themeManager } from './design-system/theme/theme-manager'

// Initialize Writer theme on app startup
themeManager.switchTheme('writer').then(() => {
  console.log('Writer theme activated - brutalist digital minimalism for writers');
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
