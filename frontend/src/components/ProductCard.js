"use client"
import { Link } from "react-router-dom"
import { FaHeart, FaShoppingCart, FaStar } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { toast } from "react-toastify"
import api from "../services/api"
import "./ProductCard.css"

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("Product is out of stock")
      return
    }
    addToCart(product)
    toast.success("Product added to cart")
  }

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist")
      return
    }

    try {
      await api.post(`/users/wishlist/${product._id}`)
      toast.success("Product added to wishlist")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to wishlist")
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="star filled" />)
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="star half" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="star" />)
    }

    return stars
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="product-card">
      <div className="product-image">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            onError={(e) => {
              e.target.src = "/placeholder.jpg"
            }}
          />
        </Link>
        {discountPercentage > 0 && <span className="discount-badge">-{discountPercentage}%</span>}
        {product.stock === 0 && <span className="stock-badge out-of-stock">Out of Stock</span>}
        {product.isFeatured && <span className="stock-badge featured">Featured</span>}
        <div className="product-actions">
          <button className="action-btn wishlist-btn" onClick={handleAddToWishlist} title="Add to Wishlist">
            <FaHeart />
          </button>
          <button
            className="action-btn cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            title="Add to Cart"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link to={`/products/${product._id}`} className="product-name">
          <h3>{product.name}</h3>
        </Link>

        <div className="product-rating">
          <div className="stars">{renderStars(product.rating)}</div>
          <span className="rating-text">
            ({product.numReviews} review{product.numReviews !== 1 ? "s" : ""})
          </span>
        </div>

        <div className="product-price">
          <span className="current-price">${product.price}</span>
          {product.originalPrice && <span className="original-price">${product.originalPrice}</span>}
        </div>

        <div className="product-meta">
          <span className="stock-info">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
          {product.salesCount > 0 && <span className="sales-count">{product.salesCount} sold</span>}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
