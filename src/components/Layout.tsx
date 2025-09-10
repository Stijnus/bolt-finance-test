import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Home } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="bg-surface border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">Expense Tracker</h1>
            <nav className="flex space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/' ? 'bg-primary text-white' : 'text-textSecondary hover:text-text'
                }`}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-textSecondary">{user?.email}</span>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-3 py-2 bg-error text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
