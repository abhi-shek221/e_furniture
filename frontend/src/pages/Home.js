"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import api from "../services/api"
import "./Home.css"

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get("/products/featured")
      setFeaturedProducts(response.data)
    } catch (error) {
      setError("Failed to load featured products")
      console.error("Error fetching featured products:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { name: "Sofas", image: "/placeholder.jpg", link: "/products?category=sofa" },
    { name: "Chairs", image: "/placeholder.jpg", link: "/products?category=chair" },
    { name: "Tables", image: "/placeholder.jpg", link: "/products?category=table" },
    { name: "Beds", image: "/placeholder.jpg", link: "/products?category=bed" },
    { name: "Cabinets", image: "/placeholder.jpg", link: "/products?category=cabinet" },
    { name: "Desks", image: "/placeholder.jpg", link: "/products?category=desk" },
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Transform Your Space with Premium Furniture</h1>
            <p>
              Discover our curated collection of modern, comfortable, and stylish furniture pieces that will make your
              house feel like home.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">
                Shop Now
              </Link>
              <Link to="/products?featured=true" className="btn btn-outline">
                View Featured
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/placeholder.jpg" alt="Beautiful furniture" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link key={index} to={category.link} className="category-card">
                <img src={category.image || "/placeholder.svg"} alt={category.name} />
                <div className="category-overlay">
                  <h3>{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="view-all-link">
              View All Products
            </Link>
          </div>

          {loading ? (
            <div className="loading">Loading featured products...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>Free shipping on orders over $100</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Easy Returns</h3>
              <p>30-day return policy for your peace of mind</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Quality Guarantee</h3>
              <p>Premium quality furniture with warranty</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>24/7 Support</h3>
              <p>Customer support available round the clock</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for the latest furniture trends and exclusive offers</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email address" className="newsletter-input" />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
