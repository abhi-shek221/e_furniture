"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <div>Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

export default ProtectedRoute
