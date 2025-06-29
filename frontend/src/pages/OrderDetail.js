"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaArrowLeft, FaCheck, FaTruck, FaBox, FaMapMarkerAlt } from "react-icons/fa"
import { toast } from "react-toastify"
import api from "../services/api"
import "./OrderDetail.css"

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data)
    } catch (error) {
      setError("Order not found")
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayOrder = async () => {
    try {
      // Simulate payment process
      const paymentResult = {
        id: `pay_${Date.now()}`,
        status: "COMPLETED",
        update_time: new Date().toISOString(),
        payer: {
          email_address: order.user.email,
        },
      }

      await api.put(`/orders/${id}/pay`, paymentResult)
      toast.success("Payment successful!")
      fetchOrder() // Refresh order data
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed")
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning"
      case "processing":
        return "badge-info"
      case "shipped":
        return "badge-primary"
      case "delivered":
        return "badge-success"
      case "cancelled":
        return "badge-danger"
      default:
        return "badge-secondary"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getOrderProgress = () => {
    const steps = [
      { key: "pending", label: "Order Placed", icon: FaCheck },
      { key: "processing", label: "Processing", icon: FaBox },
      { key: "shipped", label: "Shipped", icon: FaTruck },
      { key: "delivered", label: "Delivered", icon: FaMapMarkerAlt },
    ]

    const statusOrder = ["pending", "processing", "shipped", "delivered"]
    const currentIndex = statusOrder.indexOf(order.status)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }))
  }

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="error-page">
            <h2>Order Not Found</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/orders")} className="btn btn-primary">
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progressSteps = getOrderProgress()

  return (
    <div className="order-detail-page">
      <div className="container">
        {/* Header */}
        <div className="order-header">
          <button onClick={() => navigate("/orders")} className="back-btn">
            <FaArrowLeft /> Back to Orders
          </button>
          <div className="order-title">
            <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Order Progress */}
        <div className="order-progress">
          <h2>Order Status</h2>
          <div className="progress-steps">
            {progressSteps.map((step, index) => (
              <div
                key={step.key}
                className={`progress-step ${step.completed ? "completed" : ""} ${step.active ? "active" : ""}`}
              >
                <div className="step-icon">
                  <step.icon />
                </div>
                <div className="step-label">{step.label}</div>
                {index < progressSteps.length - 1 && (
                  <div className={`step-connector ${step.completed ? "completed" : ""}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="order-content">
          {/* Order Details */}
          <div className="order-main">
            {/* Order Items */}
            <div className="order-section">
              <h2>Order Items</h2>
              <div className="order-items">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="item-image"
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg"
                      }}
                    />
                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      <div className="item-meta">
                        <span className="item-price">${item.price}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="order-section">
              <h2>Shipping Address</h2>
              <div className="address-card">
                <div className="address-details">
                  <p className="recipient-name">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p className="phone">Phone: {order.shippingAddress.phone}</p>}
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="order-section">
              <h2>Order Timeline</h2>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-date">{formatDate(order.createdAt)}</div>
                  <div className="timeline-content">Order placed</div>
                </div>
                {order.isPaid && order.paidAt && (
                  <div className="timeline-item">
                    <div className="timeline-date">{formatDate(order.paidAt)}</div>
                    <div className="timeline-content">Payment confirmed</div>
                  </div>
                )}
                {order.isDelivered && order.deliveredAt && (
                  <div className="timeline-item">
                    <div className="timeline-date">{formatDate(order.deliveredAt)}</div>
                    <div className="timeline-content">Order delivered</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-sidebar">
            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items:</span>
                <span>${order.itemsPrice.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping:</span>
                <span>${order.shippingPrice.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Tax:</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total:</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>

              {/* Payment Status */}
              <div className="payment-status">
                <h3>Payment</h3>
                <div className="status-info">
                  <span className="status-label">Method:</span>
                  <span className="status-value">
                    {order.paymentMethod === "cod" && "Cash on Delivery"}
                    {order.paymentMethod === "paypal" && "PayPal"}
                    {order.paymentMethod === "stripe" && "Credit Card"}
                  </span>
                </div>
                <div className="status-info">
                  <span className="status-label">Status:</span>
                  <span className={`status-value ${order.isPaid ? "paid" : "unpaid"}`}>
                    {order.isPaid ? "Paid" : "Not Paid"}
                  </span>
                </div>
                {!order.isPaid && order.paymentMethod !== "cod" && (
                  <button onClick={handlePayOrder} className="btn btn-primary pay-btn">
                    Pay Now
                  </button>
                )}
              </div>

              {/* Delivery Status */}
              <div className="delivery-status">
                <h3>Delivery</h3>
                <div className="status-info">
                  <span className="status-label">Status:</span>
                  <span className={`status-value ${order.isDelivered ? "delivered" : "pending"}`}>
                    {order.isDelivered ? "Delivered" : "Not Delivered"}
                  </span>
                </div>
                {order.isDelivered && order.deliveredAt && (
                  <div className="status-info">
                    <span className="status-label">Delivered on:</span>
                    <span className="status-value">{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
