import React from 'react'
import { Navigate } from 'react-router-dom'
import { useLibraryStore } from '../state/libraryStore'

type Props = { children: JSX.Element, roles?: string[] }

export default function ProtectedRoute({ children, roles }: Props){
  const currentUser = useLibraryStore().currentUser
  if(!currentUser) return <Navigate to="/login" replace />
  if(!currentUser.emailVerified) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(currentUser.email)}`} replace />
  }
  if(roles && roles.length && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />
  }
  return children
}
