"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"
import api from "../services/api"
import "./Checkout.css"

const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    cartItems,
    shippingAddress,
    paymentMethod,
    saveShippingAddress,
    savePaymentMethod,
    clearCart,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = useCart()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    fullName: shippingAddress.fullName || user?.name || "",
    address: shippingAddress.address || "",
    city: shippingAddress.city || "",
    state: shippingAddress.state || "",
    zipCode: shippingAddress.zipCode || "",
    country: shippingAddress.country || "United States",
    phone: shippingAddress.phone || user?.phone || "",
  })

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethod || "cod")

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    saveShippingAddress(shippingForm)
    setCurrentStep(2)
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    savePaymentMethod(selectedPaymentMethod)
    setCurrentStep(3)
  }

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setLoading(true)
    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: shippingForm,
        paymentMethod: selectedPaymentMethod,
        itemsPrice: itemsPrice,
        taxPrice: taxPrice,
        shippingPrice: shippingPrice,
        totalPrice: totalPrice,
      }

      const response = await api.post("/orders", orderData)

      clearCart()
      toast.success("Order placed successfully!")
      navigate(`/orders/${response.data.order._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
        <div className="step-number">1</div>
        <div className="step-label">Shipping</div>
      </div>
      <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
        <div className="step-number">2</div>
        <div className="step-label">Payment</div>
      </div>
      <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
        <div className="step-number">3</div>
        <div className="step-label">Review</div>
      </div>
    </div>
  )

  const renderShippingStep = () => (
    <div className="checkout-step">
      <h2>Shipping Information</h2>
      <form onSubmit={handleShippingSubmit} className="shipping-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={shippingForm.fullName}
              onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={shippingForm.phone}
              onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address *</label>
          <input
            type="text"
            value={shippingForm.address}
            onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
            required
            className="form-control"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              value={shippingForm.city}
              onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              value={shippingForm.state}
              onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>ZIP Code *</label>
            <input
              type="text"
              value={shippingForm.zipCode}
              onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })}
              required
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Country *</label>
          <select
            value={shippingForm.country}
            onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
            required
            className="form-control"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Continue to Payment
        </button>
      </form>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="checkout-step">
      <h2>Payment Method</h2>
      <form onSubmit={handlePaymentSubmit} className="payment-form">
        <div className="payment-options">
          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={selectedPaymentMethod === "cod"}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <div className="payment-option-content">
              <div className="payment-title">Cash on Delivery</div>
              <div className="payment-description">Pay when you receive your order</div>
            </div>
          </label>

          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={selectedPaymentMethod === "paypal"}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <div className="payment-option-content">
              <div className="payment-title">PayPal</div>
              <div className="payment-description">Pay securely with your PayPal account</div>
            </div>
          </label>

          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={selectedPaymentMethod === "stripe"}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <div className="payment-option-content">
              <div className="payment-title">Credit/Debit Card</div>
              <div className="payment-description">Pay with Visa, MasterCard, or American Express</div>
            </div>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-secondary">
            Back to Shipping
          </button>
          <button type="submit" className="btn btn-primary">
            Review Order
          </button>
        </div>
      </form>
    </div>
  )

  const renderReviewStep = () => (
    <div className="checkout-step">
      <h2>Order Review</h2>

      {/* Shipping Address */}
      <div className="review-section">
        <h3>Shipping Address</h3>
        <div className="address-display">
          <p>{shippingForm.fullName}</p>
          <p>{shippingForm.address}</p>
          <p>
            {shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}
          </p>
          <p>{shippingForm.country}</p>
          {shippingForm.phone && <p>Phone: {shippingForm.phone}</p>}
        </div>
        <button onClick={() => setCurrentStep(1)} className="edit-btn">
          Edit
        </button>
      </div>

      {/* Payment Method */}
      <div className="review-section">
        <h3>Payment Method</h3>
        <p className="payment-display">
          {selectedPaymentMethod === "cod" && "Cash on Delivery"}
          {selectedPaymentMethod === "paypal" && "PayPal"}
          {selectedPaymentMethod === "stripe" && "Credit/Debit Card"}
        </p>
        <button onClick={() => setCurrentStep(2)} className="edit-btn">
          Edit
        </button>
      </div>

      {/* Order Items */}
      <div className="review-section">
        <h3>Order Items</h3>
        <div className="order-items">
          {cartItems.map((item) => (
            <div key={item.product} className="order-item">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="item-image" />
              <div className="item-details">
                <div className="item-name">{item.name}</div>
                <div className="item-quantity">Qty: {item.quantity}</div>
              </div>
              <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => setCurrentStep(2)} className="btn btn-secondary">
          Back to Payment
        </button>
        <button onClick={handlePlaceOrder} disabled={loading} className="btn btn-primary place-order-btn">
          {loading ? "Placing Order..." : `Place Order - $${totalPrice.toFixed(2)}`}
        </button>
      </div>
    </div>
  )

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        {renderStepIndicator()}

        <div className="checkout-content">
          <div className="checkout-main">
            {currentStep === 1 && renderShippingStep()}
            {currentStep === 2 && renderPaymentStep()}
            {currentStep === 3 && renderReviewStep()}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)}):</span>
                <span>${itemsPrice.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping:</span>
                <span>{shippingPrice === 0 ? "Free" : `$${shippingPrice.toFixed(2)}`}</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
