"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaEye, FaShoppingBag } from "react-icons/fa"
import api from "../services/api"
import "./Orders.css"

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/orders/myorders?page=${currentPage}&limit=10`)
      setOrders(response.data.orders)
      setPagination(response.data.pagination)
    } catch (error) {
      setError("Failed to load orders")
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
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
      month: "short",
      day: "numeric",
    })
  }

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null

    const pages = []
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pagination-btn ${i === pagination.currentPage ? "active" : ""}`}
        >
          {i}
        </button>,
      )
    }

    return (
      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
          Previous
        </button>
        {pages}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="loading">Loading your orders...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="empty-orders">
            <FaShoppingBag className="empty-icon" />
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="page-header">
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status">
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.orderItems.slice(0, 3).map((item, index) => (
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
                      <div className="item-name">{item.name}</div>
                      <div className="item-quantity">Qty: {item.quantity}</div>
                    </div>
                    <div className="item-price">${item.price}</div>
                  </div>
                ))}
                {order.orderItems.length > 3 && (
                  <div className="more-items">
                    +{order.orderItems.length - 3} more item{order.orderItems.length - 3 !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span className="total-label">Total: </span>
                  <span className="total-amount">${order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="order-actions">
                  <Link to={`/orders/${order._id}`} className="btn btn-outline view-btn">
                    <FaEye /> View Details
                  </Link>
                </div>
              </div>

              {/* Payment and Delivery Status */}
              <div className="order-status-bar">
                <div className="status-item">
                  <span className="status-label">Payment:</span>
                  <span className={`status-value ${order.isPaid ? "paid" : "unpaid"}`}>
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Delivery:</span>
                  <span className={`status-value ${order.isDelivered ? "delivered" : "pending"}`}>
                    {order.isDelivered ? "Delivered" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {renderPagination()}
      </div>
    </div>
  )
}

export default Orders
