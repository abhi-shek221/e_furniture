"use client"

import { useState, useEffect } from "react"
import { FaTrash, FaSearch, FaUserShield, FaUser } from "react-icons/fa"
import { toast } from "react-toastify"
import api from "../../services/api"
import "./AdminUsers.css"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  })

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/users?${params.toString()}`)
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error("Failed to load users")
      console.error("Error fetching users:", error)
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

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await api.delete(`/users/${userId}`)
        toast.success("User deleted successfully")
        fetchUsers()
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete user")
      }
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
    <div className="admin-users">
      <div className="container">
        <div className="page-header">
          <h1>User Management</h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{pagination.totalUsers || 0}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{users.filter((user) => user.isAdmin).length}</span>
              <span className="stat-label">Admins</span>
            </div>
          </div>
        </div>

        {/* Search Filter */}
        <div className="filters-section">
          <div className="search-filter">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="no-users">
              <h3>No users found</h3>
              <p>Try adjusting your search terms</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-id">ID: {user._id.slice(-8).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td className="user-phone">{user.phone || "N/A"}</td>
                    <td>
                      <div className="user-role">
                        {user.isAdmin ? (
                          <span className="role-badge admin">
                            <FaUserShield /> Admin
                          </span>
                        ) : (
                          <span className="role-badge customer">
                            <FaUser /> Customer
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="join-date">{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="actions">
                        {!user.isAdmin && (
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="btn-icon delete"
                            title="Delete user"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {renderPagination()}

        {/* User Statistics */}
        <div className="user-stats">
          <h2>User Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <FaUser />
              </div>
              <div className="stat-content">
                <h3>{pagination.totalUsers || 0}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon admins">
                <FaUserShield />
              </div>
              <div className="stat-content">
                <h3>{users.filter((user) => user.isAdmin).length}</h3>
                <p>Admin Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon customers">
                <FaUser />
              </div>
              <div className="stat-content">
                <h3>{users.filter((user) => !user.isAdmin).length}</h3>
                <p>Customers</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon recent">
                <FaUser />
              </div>
              <div className="stat-content">
                <h3>
                  {
                    users.filter((user) => {
                      const joinDate = new Date(user.createdAt)
                      const thirtyDaysAgo = new Date()
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                      return joinDate > thirtyDaysAgo
                    }).length
                  }
                </h3>
                <p>New This Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
