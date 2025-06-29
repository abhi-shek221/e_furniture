"use client";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    addToCart(product);
    toast.success("Product added to cart!");
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      return;
    }

    toast.success("Added to wishlist!");
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star">
          ☆
        </span>
      );
    }

    return stars;
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/products/${product._id}`} className="product-image-link">
          <img
            src={
              product.images && product.images[0]
                ? product.images[0]
                : "/placeholder.svg?height=300&width=300"
            }
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=300&width=300";
            }}
          />
        </Link>

        {/* Top Left Badges */}
        {(discountPercentage > 0 || product.isFeatured) && (
          <div className="top-left-badges">
            {discountPercentage > 0 && (
              <span className="badge discount-badge">
                -{discountPercentage}%
              </span>
            )}
            {product.isFeatured && (
              <span className="badge featured-badge">Featured</span>
            )}
          </div>
        )}

        {/* Top Right Actions */}
        <div className="top-right-actions">
          <button
            className="action-btn wishlist-btn"
            onClick={handleAddToWishlist}
            title="Add to Wishlist"
          >
            ♡
          </button>
          <button className="action-btn quick-view-btn" title="Quick View">
            👁
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="out-of-stock-overlay">
            <span className="out-of-stock-text">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="product-content">
        <Link to={`/products/${product._id}`} className="product-info-link">
          <div className="product-category">{product.category}</div>
          <h3 className="product-name">{product.name}</h3>

          <div className="product-rating">
            <div className="stars">{renderStars(product.rating)}</div>
            <span className="rating-count">({product.numReviews})</span>
          </div>

          <div className="product-price">
            <span className="current-price">${product.price}</span>
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice}</span>
            )}
          </div>

          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">{product.stock} in stock</span>
            ) : (
              <span className="out-of-stock-status">Out of stock</span>
            )}
          </div>
        </Link>

        <div className="product-actions">
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
