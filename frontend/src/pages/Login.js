"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"
import "./Auth.css"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect)
    }
  }, [isAuthenticated, navigate, redirect])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData)

    if (result.success) {
      toast.success("Login successful!")
      navigate(redirect)
    } else {
      toast.error(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Sign in to your account to continue shopping</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <Link to={`/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`}>Create one here</Link>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="demo-accounts">
              <h3>Demo Accounts</h3>
              <div className="demo-account">
                <strong>Admin Account:</strong>
                <p>Email: admin@furniture.com</p>
                <p>Password: admin123</p>
              </div>
              <div className="demo-account">
                <strong>Customer Account:</strong>
                <p>Email: customer@furniture.com</p>
                <p>Password: customer123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
