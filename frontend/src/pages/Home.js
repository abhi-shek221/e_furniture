"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import api from "../services/api"
import "./Home.css"

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get("/products/featured")
        setFeaturedProducts(response.data)
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const categories = [
    { name: "Sofas", image: "/placeholder.svg?height=200&width=200", link: "/products?category=sofa" },
    { name: "Beds", image: "/placeholder.svg?height=200&width=200", link: "/products?category=bed" },
    { name: "Tables", image: "/placeholder.svg?height=200&width=200", link: "/products?category=table" },
    { name: "Chairs", image: "/placeholder.svg?height=200&width=200", link: "/products?category=chair" },
    { name: "Cabinets", image: "/placeholder.svg?height=200&width=200", link: "/products?category=cabinet" },
    { name: "Desks", image: "/placeholder.svg?height=200&width=200", link: "/products?category=desk" },
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Transform Your Space with Quality Furniture</h1>
          <p>Discover our collection of modern, comfortable, and affordable furniture for every room in your home.</p>
          <Link to="/products" className="btn btn-primary hero-btn">
            Shop Now
          </Link>
        </div>
        <div className="hero-image">
          <img src="/placeholder.svg?height=400&width=600" alt="Modern furniture" />
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
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          {loading ? (
            <div className="loading">Loading featured products...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-3">
            <Link to="/products" className="btn btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>Free shipping on orders over $500</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔄</div>
              <h3>Easy Returns</h3>
              <p>30-day return policy for your peace of mind</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⭐</div>
              <h3>Quality Guarantee</h3>
              <p>High-quality furniture with warranty</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💬</div>
              <h3>24/7 Support</h3>
              <p>Customer support available round the clock</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
