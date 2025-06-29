"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaHeart, FaShoppingCart, FaTrash } from "react-icons/fa"
import { useCart } from "../context/CartContext"
import { toast } from "react-toastify"
import api from "../services/api"
import "./Wishlist.css"

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { addToCart } = useCart()

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/users/wishlist")
      setWishlistItems(response.data)
    } catch (error) {
      setError("Failed to load wishlist")
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await api.delete(`/users/wishlist/${productId}`)
      setWishlistItems(wishlistItems.filter((item) => item._id !== productId))
      toast.success("Item removed from wishlist")
    } catch (error) {
      toast.error("Failed to remove item from wishlist")
    }
  }

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error("Product is out of stock")
      return
    }
    addToCart(product)
    toast.success("Product added to cart")
  }

  const handleMoveToCart = async (product) => {
    handleAddToCart(product)
    await handleRemoveFromWishlist(product._id)
  }

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="loading">Loading your wishlist...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="empty-wishlist">
            <FaHeart className="empty-icon" />
            <h2>Your Wishlist is Empty</h2>
            <p>Save items you love to your wishlist and shop them later!</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="page-header">
          <h1>My Wishlist</h1>
          <p>
            Items you've saved for later ({wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""})
          </p>
        </div>

        <div className="wishlist-grid">
          {wishlistItems.map((product) => (
            <div key={product._id} className="wishlist-item">
              <div className="item-image">
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.images[0]?.url || "/placeholder.jpg"}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg"
                    }}
                  />
                </Link>
                {product.stock === 0 && <span className="stock-badge out-of-stock">Out of Stock</span>}
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  title="Remove from wishlist"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="item-details">
                <div className="item-category">{product.category}</div>
                <Link to={`/products/${product._id}`} className="item-name">
                  <h3>{product.name}</h3>
                </Link>

                <div className="item-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < Math.floor(product.rating) ? "filled" : ""}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">
                    ({product.numReviews} review{product.numReviews !== 1 ? "s" : ""})
                  </span>
                </div>

                <div className="item-price">
                  <span className="current-price">${product.price}</span>
                  {product.originalPrice && <span className="original-price">${product.originalPrice}</span>}
                </div>

                <div className="item-actions">
                  <button
                    className="btn btn-primary add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                  <button
                    className="btn btn-outline move-to-cart-btn"
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0}
                  >
                    Move to Cart
                  </button>
                </div>

                <div className="item-stock">
                  {product.stock > 0 ? (
                    <span className="in-stock">✓ {product.stock} in stock</span>
                  ) : (
                    <span className="out-of-stock">✗ Out of stock</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wishlist Actions */}
        <div className="wishlist-actions">
          <Link to="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => {
              const availableItems = wishlistItems.filter((item) => item.stock > 0)
              if (availableItems.length === 0) {
                toast.error("No items available to add to cart")
                return
              }
              availableItems.forEach((item) => addToCart(item))
              toast.success(`${availableItems.length} item(s) added to cart`)
            }}
          >
            Add All to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default Wishlist
