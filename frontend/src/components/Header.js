"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import "./Header.css"

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { getCartItemsCount } = useCart()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`)
      setSearchTerm("")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h2>FurnitureStore</h2>
          </Link>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search furniture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>

          <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
            <Link to="/products" className="nav-link">
              Products
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="nav-link">
                  Wishlist
                </Link>
                <Link to="/orders" className="nav-link">
                  Orders
                </Link>
                <div className="dropdown">
                  <button className="dropdown-btn">{user?.name} ▼</button>
                  <div className="dropdown-content">
                    <Link to="/profile">Profile</Link>
                    {user?.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </>
            )}

            <Link to="/cart" className="cart-link">
              Cart ({getCartItemsCount()})
            </Link>
          </nav>

          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
