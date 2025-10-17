import React, { lazy, Suspense, useEffect } from 'react'
import type { User } from './types'
import { useGlobalLogging, useNavigationLogging, useInteractionLogging, useApiLogging } from './src/hooks/useGlobalLogging'
import { useLogging } from './src/hooks/useLogging'
import { sessionManager } from './src/services/sessionManager'
import { useAuthStore } from './src/store/authStore'

const LoginPage = lazy(() => import('./src/components/features/auth/LoginPage/LoginPage'))
const Dashboard = lazy(() => import('./src/components/layout/Dashboard'))

const App: React.FC = () => {
  const { currentUser, login, logout } = useAuthStore()
  const { logAuthentication } = useLogging()

  // Initialize global logging
  useGlobalLogging()
  useNavigationLogging()
  useInteractionLogging()
  useApiLogging()

  const handleLoginSuccess = (user: User) => {
    sessionManager.createSession({
      userId: user.username,
      username: user.username,
      role: user.role,
      name: user.name,
      ip: '127.0.0.1',
      userAgent: navigator.userAgent,
    })

    login(user)
  }

  const handleLogout = () => {
    sessionManager.logout()
    logout()
  }

  useEffect(() => {
    const checkSession = () => {
      if (currentUser && !sessionManager.isSessionValid()) {
        logout()
      }
    }

    const interval = setInterval(checkSession, 60000)

    return () => clearInterval(interval)
  }, [currentUser, logout])

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-100 font-sans">Loading...</div>}>
      <div className="bg-gray-100 h-screen font-sans">
        {currentUser ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </Suspense>
  )
}

export default App

