"use client"

import { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from "react-icons/fa"
import { toast } from "react-toastify"
import api from "../../services/api"
import "./AdminProducts.css"

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [categories, setCategories] = useState([])

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    page: 1,
    limit: 10,
  })

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "sofa",
    brand: "",
    material: "",
    color: "",
    stock: "",
    isFeatured: false,
    isAvailable: true,
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [filters])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/products?${params.toString()}`)
      setProducts(response.data.products)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error("Failed to load products")
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get("/products/categories")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 })
  }

  const handlePageChange = (page) => {
    setFilters({ ...filters, page })
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || "",
        category: product.category,
        brand: product.brand || "",
        material: product.material || "",
        color: product.color || "",
        stock: product.stock,
        isFeatured: product.isFeatured,
        isAvailable: product.isAvailable,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "sofa",
        brand: "",
        material: "",
        color: "",
        stock: "",
        isFeatured: false,
        isAvailable: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData)
        toast.success("Product updated successfully")
      } else {
        await api.post("/products", formData)
        toast.success("Product created successfully")
      }

      closeModal()
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product")
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${productId}`)
        toast.success("Product deleted successfully")
        fetchProducts()
      } catch (error) {
        toast.error("Failed to delete product")
      }
    }
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
    <div className="admin-products">
      <div className="container">
        <div className="page-header">
          <h1>Product Management</h1>
          <button onClick={() => openModal()} className="btn btn-primary">
            <FaPlus /> Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-filter">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filter">
            <FaFilter className="filter-icon" />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="products-table-container">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your filters or add a new product</p>
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.images[0]?.url || "/placeholder.jpg"}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg"
                        }}
                      />
                    </td>
                    <td>
                      <div className="product-name">
                        {product.name}
                        {product.isFeatured && <span className="featured-badge">Featured</span>}
                      </div>
                    </td>
                    <td className="category">{product.category}</td>
                    <td className="price">${product.price}</td>
                    <td className={`stock ${product.stock === 0 ? "out-of-stock" : ""}`}>{product.stock}</td>
                    <td>
                      <span className={`status-badge ${product.isAvailable ? "available" : "unavailable"}`}>
                        {product.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button onClick={() => openModal(product)} className="btn-icon edit" title="Edit product">
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="btn-icon delete"
                          title="Delete product"
                        >
                          <FaTrash />
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

        {/* Product Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={closeModal} className="close-btn">
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="form-control"
                    >
                      <option value="sofa">Sofa</option>
                      <option value="chair">Chair</option>
                      <option value="table">Table</option>
                      <option value="bed">Bed</option>
                      <option value="cabinet">Cabinet</option>
                      <option value="desk">Desk</option>
                      <option value="bookshelf">Bookshelf</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="4"
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Original Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Material</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      />
                      Featured Product
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      />
                      Available for Sale
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? "Update Product" : "Create Product"}
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

export default AdminProducts
