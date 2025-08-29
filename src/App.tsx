import React from 'react'
import { AuthProvider } from './providers/AuthProvider'
import { LoginScreen } from './features/auth/LoginScreen'
import { DeckScreen } from './features/decks/DeckScreen'
import { useAuthContext } from './providers/AuthProvider'

function AppContent() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return <DeckScreen />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
