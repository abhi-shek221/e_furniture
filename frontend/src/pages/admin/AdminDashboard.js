"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import api from "../../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        api.get("/users?limit=1"),
        api.get("/products?limit=1"),
        api.get("/orders?limit=5"),
      ]);

      // Calculate total revenue from recent orders
      const totalRevenue = ordersRes.data.orders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      );

      setStats({
        totalUsers: usersRes.data.pagination.totalUsers,
        totalProducts: productsRes.data.pagination.totalProducts,
        totalOrders: ordersRes.data.pagination.totalOrders,
        totalRevenue: totalRevenue,
        recentOrders: ordersRes.data.orders,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "processing":
        return "badge-info";
      case "shipped":
        return "badge-primary";
      case "delivered":
        return "badge-success";
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome to your furniture store management panel</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
              <div className="stat-trend positive">
                <FaArrowUp /> +12% from last month
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon products">
              <FaBox />
            </div>
            <div className="stat-content">
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
              <div className="stat-trend positive">
                <FaArrowUp /> +8% from last month
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">
              <FaShoppingCart />
            </div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
              <div className="stat-trend negative">
                <FaArrowDown /> -3% from last month
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(stats.totalRevenue)}</h3>
              <p>Total Revenue</p>
              <div className="stat-trend positive">
                <FaArrowUp /> +15% from last month
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/products" className="action-card">
              <FaBox className="action-icon" />
              <h3>Manage Products</h3>
              <p>Add, edit, or remove products from your inventory</p>
            </Link>

            <Link to="/admin/orders" className="action-card">
              <FaShoppingCart className="action-icon" />
              <h3>Manage Orders</h3>
              <p>View and update order status and details</p>
            </Link>

            <Link to="/admin/users" className="action-card">
              <FaUsers className="action-icon" />
              <h3>Manage Users</h3>
              <p>View and manage customer accounts</p>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="view-all-link">
              View All Orders
            </Link>
          </div>

          <div className="recent-orders">
            {stats.recentOrders.length === 0 ? (
              <div className="no-data">No recent orders</div>
            ) : (
              <div className="orders-table">
                <div className="table-header">
                  <div>Order ID</div>
                  <div>Customer</div>
                  <div>Date</div>
                  <div>Status</div>
                  <div>Total</div>
                </div>
                {stats.recentOrders.map((order) => (
                  <div key={order._id} className="table-row">
                    <div className="order-id">
                      #{order._id.slice(-8).toUpperCase()}
                    </div>
                    <div className="customer-name">
                      {order.user?.name || "Unknown"}
                    </div>
                    <div className="order-date">
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="order-status">
                      <span
                        className={`badge ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <div className="order-total">
                      {formatCurrency(order.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
