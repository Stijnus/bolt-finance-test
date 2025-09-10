import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { AuthForm } from './components/AuthForm'
import { ExpenseTracker } from './pages/ExpenseTracker'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/auth" />
}

const AppRoutes: React.FC = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to="/" /> : <AuthForm />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <ExpenseTracker />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </AuthProvider>
  )
}

export default App
