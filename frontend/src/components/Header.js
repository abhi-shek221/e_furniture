"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaShoppingCart, FaUser, FaHeart, FaSearch, FaBars, FaTimes } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import "./Header.css"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, isAuthenticated, logout } = useAuth()
  const { cartItems } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <h2>FurnitureStore</h2>
          </Link>

          {/* Search Bar */}
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search furniture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <FaSearch />
            </button>
          </form>

          {/* Navigation */}
          <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/products" className="nav-link">
              Products
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="nav-link">
                  <FaHeart /> Wishlist
                </Link>
                <Link to="/orders" className="nav-link">
                  Orders
                </Link>
                {user?.isAdmin && (
                  <Link to="/admin" className="nav-link admin-link">
                    Admin
                  </Link>
                )}
                <div className="user-menu">
                  <span className="nav-link">
                    <FaUser /> {user?.name}
                  </span>
                  <div className="dropdown">
                    <Link to="/profile" className="dropdown-item">
                      Profile
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item">
                      Logout
                    </button>
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

            <Link to="/cart" className="nav-link cart-link">
              <FaShoppingCart />
              <span className="cart-count">{cartItemsCount}</span>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
