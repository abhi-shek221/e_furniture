"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import api from "../services/api"
import "./Products.css"

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "newest",
    inStock: searchParams.get("inStock") === "true",
    page: Number.parseInt(searchParams.get("page")) || 1,
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [searchParams])

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
      setError("Failed to load products")
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
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)
    updateSearchParams(newFilters)
  }

  const updateSearchParams = (newFilters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== false) {
        params.set(key, value)
      }
    })
    setSearchParams(params)
  }

  const handlePageChange = (page) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    updateSearchParams(newFilters)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearFilters = () => {
    const newFilters = {
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest",
      inStock: false,
      page: 1,
    }
    setFilters(newFilters)
    setSearchParams({})
  }

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
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
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1>Our Products</h1>
          <p>Discover our wide range of quality furniture pieces</p>
        </div>

        <div className="products-content">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All
              </button>
            </div>

            {/* Search Filter */}
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search products..."
                className="filter-input"
              />
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label>Category</label>
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

            {/* Price Range Filter */}
            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  placeholder="Min"
                  className="filter-input price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  placeholder="Max"
                  className="filter-input price-input"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                />
                In Stock Only
              </label>
            </div>
          </aside>

          {/* Products Section */}
          <main className="products-main">
            {/* Sort and Results Info */}
            <div className="products-header">
              <div className="results-info">
                {pagination.totalProducts > 0 ? (
                  <span>
                    Showing {(pagination.currentPage - 1) * 12 + 1}-
                    {Math.min(pagination.currentPage * 12, pagination.totalProducts)} of {pagination.totalProducts}{" "}
                    products
                  </span>
                ) : (
                  <span>No products found</span>
                )}
              </div>

              <div className="sort-controls">
                <label>Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {renderPagination()}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Products
