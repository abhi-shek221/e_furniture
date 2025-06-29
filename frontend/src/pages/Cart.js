"use client";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <FaShoppingBag className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button onClick={clearCart} className="clear-cart-btn">
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.product} className="cart-item">
                <div className="item-image">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </div>

                <div className="item-details">
                  <Link to={`/products/${item.product}`} className="item-name">
                    <h3>{item.name}</h3>
                  </Link>
                  <div className="item-price">${item.price}</div>
                  <div className="item-stock">
                    {item.countInStock > 0
                      ? `${item.countInStock} in stock`
                      : "Out of stock"}
                  </div>
                </div>

                <div className="item-quantity">
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        updateQuantity(item.product, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="quantity-btn"
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.countInStock}
                      className="quantity-btn"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeFromCart(item.product)}
                  className="remove-btn"
                  title="Remove item"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>
                  Items (
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}):
                </span>
                <span>${itemsPrice.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping:</span>
                <span>
                  {shippingPrice === 0
                    ? "Free"
                    : `$${shippingPrice.toFixed(2)}`}
                </span>
              </div>

              <div className="summary-row">
                <span>Tax:</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              {shippingPrice > 0 && (
                <div className="shipping-notice">
                  Add ${(100 - itemsPrice).toFixed(2)} more for free shipping!
                </div>
              )}

              <button
                onClick={handleCheckout}
                className="btn btn-primary checkout-btn"
              >
                Proceed to Checkout
              </button>

              <Link to="/products" className="continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
