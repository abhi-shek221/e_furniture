"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaStar, FaHeart, FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { toast } from "react-toastify"
import api from "../services/api"
import "./ProductDetail.css"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      setError("Product not found")
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("Product is out of stock")
      return
    }
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`)
      return
    }
    addToCart(product, quantity)
    toast.success(`${quantity} item(s) added to cart`)
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

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error("Please login to submit a review")
      return
    }

    setSubmittingReview(true)
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewText,
      })
      toast.success("Review submitted successfully")
      setReviewText("")
      setReviewRating(5)
      fetchProduct() // Refresh product data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`star ${i <= rating ? "filled" : ""} ${interactive ? "interactive" : ""}`}
          onClick={interactive ? () => onStarClick(i) : undefined}
        />,
      )
    }
    return stars
  }

  if (loading) {
    return <div className="loading">Loading product details...</div>
  }

  if (error || !product) {
    return (
      <div className="error-page">
        <h2>Product Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/products")} className="btn btn-primary">
          Back to Products
        </button>
      </div>
    )
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-content">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img
                src={product.images[selectedImage]?.url || "/placeholder.jpg"}
                alt={product.name}
                onError={(e) => {
                  e.target.src = "/placeholder.jpg"
                }}
              />
              {discountPercentage > 0 && <span className="discount-badge">-{discountPercentage}%</span>}
            </div>
            {product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className={selectedImage === index ? "active" : ""}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg"
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-category">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>

            <div className="product-rating">
              <div className="stars">{renderStars(product.rating)}</div>
              <span className="rating-text">
                {product.rating.toFixed(1)} ({product.numReviews} review{product.numReviews !== 1 ? "s" : ""})
              </span>
            </div>

            <div className="product-price">
              <span className="current-price">${product.price}</span>
              {product.originalPrice && <span className="original-price">${product.originalPrice}</span>}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="product-details">
              {product.brand && (
                <div className="detail-item">
                  <strong>Brand:</strong> {product.brand}
                </div>
              )}
              {product.material && (
                <div className="detail-item">
                  <strong>Material:</strong> {product.material}
                </div>
              )}
              {product.color && (
                <div className="detail-item">
                  <strong>Color:</strong> {product.color}
                </div>
              )}
              {product.dimensions && (
                <div className="detail-item">
                  <strong>Dimensions:</strong> {product.dimensions.length} x {product.dimensions.width} x{" "}
                  {product.dimensions.height} {product.dimensions.unit}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {product.stock > 0 ? (
                <span className="in-stock">✓ {product.stock} in stock</span>
              ) : (
                <span className="out-of-stock">✗ Out of stock</span>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                  <FaMinus />
                </button>
                <span className="quantity">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <FaPlus />
                </button>
              </div>

              <button
                className="btn btn-primary add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FaShoppingCart /> Add to Cart
              </button>

              <button className="btn btn-outline wishlist-btn" onClick={handleAddToWishlist}>
                <FaHeart /> Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>

          {/* Review Form */}
          {isAuthenticated && (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <h3>Write a Review</h3>
              <div className="rating-input">
                <label>Rating:</label>
                <div className="stars">{renderStars(reviewRating, true, setReviewRating)}</div>
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
                required
                rows="4"
              />
              <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {product.reviews.length === 0 ? (
              <p>No reviews yet. Be the first to review this product!</p>
            ) : (
              product.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-name">{review.name}</div>
                    <div className="review-rating">{renderStars(review.rating)}</div>
                    <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="review-comment">{review.comment}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
