"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case "USER_LOADED":
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      }
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload.token)
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
      }
    case "AUTH_ERROR":
    case "LOGIN_FAIL":
    case "REGISTER_FAIL":
    case "LOGOUT":
      localStorage.removeItem("token")
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      }
    case "CLEAR_ERRORS":
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user
  const loadUser = async () => {
    if (localStorage.token) {
      api.setAuthToken(localStorage.token)
    }

    try {
      const res = await api.get("/auth/me")
      dispatch({
        type: "USER_LOADED",
        payload: res.data.user,
      })
    } catch (err) {
      dispatch({ type: "AUTH_ERROR" })
    }
  }

  // Register user
  const register = async (formData) => {
    try {
      const res = await api.post("/auth/register", formData)
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: res.data,
      })
      loadUser()
      return { success: true }
    } catch (err) {
      const error = err.response?.data?.message || "Registration failed"
      dispatch({
        type: "REGISTER_FAIL",
        payload: error,
      })
      return { success: false, error }
    }
  }

  // Login user
  const login = async (formData) => {
    try {
      const res = await api.post("/auth/login", formData)
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: res.data,
      })
      loadUser()
      return { success: true }
    } catch (err) {
      const error = err.response?.data?.message || "Login failed"
      dispatch({
        type: "LOGIN_FAIL",
        payload: error,
      })
      return { success: false, error }
    }
  }

  // Logout
  const logout = () => {
    dispatch({ type: "LOGOUT" })
  }

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: "CLEAR_ERRORS" })
  }

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        clearErrors,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
