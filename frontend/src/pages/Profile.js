"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"
import api from "../services/api"
import "./Profile.css"

const Profile = () => {
  const { user, loadUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      zipCode: user?.address?.zipCode || "",
      country: user?.address?.country || "",
    },
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.put("/users/profile", profileForm)
      toast.success("Profile updated successfully")
      loadUser() // Refresh user data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      await api.put("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success("Password changed successfully")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const renderProfileTab = () => (
    <div className="tab-content">
      <h2>Profile Information</h2>
      <form onSubmit={handleProfileSubmit} className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            className="form-control"
          />
        </div>

        <h3>Address</h3>
        <div className="form-group">
          <label>Street Address</label>
          <input
            type="text"
            value={profileForm.address.street}
            onChange={(e) =>
              setProfileForm({
                ...profileForm,
                address: { ...profileForm.address, street: e.target.value },
              })
            }
            className="form-control"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={profileForm.address.city}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  address: { ...profileForm.address, city: e.target.value },
                })
              }
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={profileForm.address.state}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  address: { ...profileForm.address, state: e.target.value },
                })
              }
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>ZIP Code</label>
            <input
              type="text"
              value={profileForm.address.zipCode}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  address: { ...profileForm.address, zipCode: e.target.value },
                })
              }
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            value={profileForm.address.country}
            onChange={(e) =>
              setProfileForm({
                ...profileForm,
                address: { ...profileForm.address, country: e.target.value },
              })
            }
            className="form-control"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  )

  const renderPasswordTab = () => (
    <div className="tab-content">
      <h2>Change Password</h2>
      <form onSubmit={handlePasswordSubmit} className="password-form">
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="form-control"
            required
            minLength="6"
          />
          <small className="form-text">Password must be at least 6 characters</small>
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="form-control"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  )

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Account</h1>
          <p>Manage your profile and account settings</p>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="user-info">
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="user-details">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
                {user?.isAdmin && <span className="admin-badge">Admin</span>}
              </div>
            </div>

            <nav className="profile-nav">
              <button
                className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile Information
              </button>
              <button
                className={`nav-item ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                Change Password
              </button>
            </nav>
          </div>

          <div className="profile-main">
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "password" && renderPasswordTab()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
