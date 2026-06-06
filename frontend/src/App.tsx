import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { libraryActions, useLibraryStore } from './state/libraryStore'
import TopNav from './components/layout/TopNav'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import BooksList from './pages/BooksList'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import AdminBooks from './pages/AdminBooks'
import Loans from './pages/Loans'
import Overdue from './pages/Overdue'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Profile from './pages/Profile'
import styles from './App.module.css'

function AppLoader({ children }: { children: React.ReactNode }) {
  const loading = useLibraryStore((state) => state.loading)
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Завантаження...</div>
      </div>
    )
  }
  return <>{children}</>
}

export default function App(){
  const { initialize } = libraryActions
  useEffect(() => {
    void initialize()
  }, [initialize])

  return (
    <div className={styles.app}>
      <TopNav />
      <main className={styles.main}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/catalog" element={<ProtectedRoute><BooksList /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_LIBRARIAN']}><AdminBooks /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_LIBRARIAN', 'ROLE_READER']}><Loans /></ProtectedRoute>} />
          <Route path="/my-loans" element={<ProtectedRoute roles={['ROLE_READER']}><Loans /></ProtectedRoute>} />
          <Route path="/overdue" element={<ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_LIBRARIAN']}><Overdue /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={['ROLE_ADMIN']}><Users /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
