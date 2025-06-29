"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaEye, FaEdit, FaSearch, FaFilter } from "react-icons/fa"
import { toast } from "react-toastify"
import api from "../../services/api"
import "./AdminOrders.css"

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newStatus, setNewStatus] = useState("")

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
  })

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#ffc107" },
    { value: "processing", label: "Processing", color: "#17a2b8" },
    { value: "shipped", label: "Shipped", color: "#007bff" },
    { value: "delivered", label: "Delivered", color: "#28a745" },
    { value: "cancelled", label: "Cancelled", color: "#dc3545" },
  ]

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/orders?${params.toString()}`)
      setOrders(response.data.orders)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error("Failed to load orders")
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 })
  }

  const handlePageChange = (page) => {
    setFilters({ ...filters, page })
  }

  const openStatusModal = (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setShowStatusModal(true)
  }

  const closeStatusModal = () => {
    setShowStatusModal(false)
    setSelectedOrder(null)
    setNewStatus("")
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()

    try {
      await api.put(`/orders/${selectedOrder._id}/status`, { status: newStatus })
      toast.success("Order status updated successfully")
      closeStatusModal()
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order status")
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null

    const pages = []
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === pagination.currentPage ? "active" : ""}`}
        >
          {i}
        </button>,
      )
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev}
          className="pagination-btn"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="admin-orders">
      <div className="container">
        <div className="page-header">
          <h1>Order Management</h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{pagination.totalOrders || 0}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-filter">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="search-input"
            />
          </div>

          <div className="status-filter">
            <FaFilter className="filter-icon" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <h3>No orders found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{order.user?.name || "Unknown"}</div>
                        <div className="customer-email">{order.user?.email || "N/A"}</div>
                      </div>
                    </td>
                    <td className="order-date">{formatDate(order.createdAt)}</td>
                    <td className="items-count">
                      {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                    </td>
                    <td className="order-total">{formatCurrency(order.totalPrice)}</td>
                    <td>
                      <span className={`payment-status ${order.isPaid ? "paid" : "unpaid"}`}>
                        {order.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <Link to={`/orders/${order._id}`} className="btn-icon view" title="View order details">
                          <FaEye />
                        </Link>
                        <button onClick={() => openStatusModal(order)} className="btn-icon edit" title="Update status">
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {renderPagination()}

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="modal-overlay" onClick={closeStatusModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Order Status</h2>
                <button onClick={closeStatusModal} className="close-btn">
                  &times;
                </button>
              </div>

              <form onSubmit={handleStatusUpdate} className="status-form">
                <div className="order-info">
                  <p>
                    <strong>Order ID:</strong> #{selectedOrder?._id.slice(-8).toUpperCase()}
                  </p>
                  <p>
                    <strong>Customer:</strong> {selectedOrder?.user?.name}
                  </p>
                  <p>
                    <strong>Current Status:</strong>
                    <span className={`badge ${getStatusBadgeClass(selectedOrder?.status)}`}>
                      {selectedOrder?.status.charAt(0).toUpperCase() + selectedOrder?.status.slice(1)}
                    </span>
                  </p>
                </div>

                <div className="form-group">
                  <label>New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    className="form-control"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={closeStatusModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders
