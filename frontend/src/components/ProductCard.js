"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import "./ProductCard.css"

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product, 1)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>,
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>,
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star">
          ☆
        </span>,
      )
    }

    return stars
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-link">
        <div className="product-image">
          <img
            src={product.images[0] || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=200&width=200"
            }}
          />
          {product.countInStock === 0 && <div className="out-of-stock">Out of Stock</div>}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category}</p>

          <div className="product-rating">
            {renderStars(product.rating)}
            <span className="rating-count">({product.numReviews})</span>
          </div>

          <div className="product-price">${product.price}</div>
        </div>
      </Link>

      <div className="product-actions">
        <button
          className="btn btn-primary add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.countInStock === 0}
        >
          {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
