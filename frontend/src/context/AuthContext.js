"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload.token)
      return {
        ...state,
        token: action.payload.token,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      }
    case "USER_LOADED":
      return {
        ...state,
        user: action.payload,
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
        user: null,
        isAuthenticated: false,
        loading: false,
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: true,
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    token: localStorage.getItem("token"),
    user: null,
    isAuthenticated: false,
    loading: true,
  })

  // Load user
  const loadUser = async () => {
    if (localStorage.token) {
      api.setAuthToken(localStorage.token)
    }

    try {
      const res = await api.get("/auth/me")
      dispatch({
        type: "USER_LOADED",
        payload: res.data,
      })
    } catch (err) {
      dispatch({ type: "AUTH_ERROR" })
    }
  }

  // Register user
  const register = async (formData) => {
    try {
      dispatch({ type: "SET_LOADING" })
      const res = await api.post("/auth/register", formData)
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: res.data,
      })
      loadUser()
      return { success: true }
    } catch (err) {
      dispatch({ type: "REGISTER_FAIL" })
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      }
    }
  }

  // Login user
  const login = async (formData) => {
    try {
      dispatch({ type: "SET_LOADING" })
      const res = await api.post("/auth/login", formData)
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: res.data,
      })
      loadUser()
      return { success: true }
    } catch (err) {
      dispatch({ type: "LOGIN_FAIL" })
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      }
    }
  }

  // Logout
  const logout = () => {
    dispatch({ type: "LOGOUT" })
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
