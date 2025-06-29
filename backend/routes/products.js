const express = require("express")
const multer = require("multer")
const path = require("path")
const Product = require("../models/Product")
const { auth, admin } = require("../middleware/auth")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb)
  },
})

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb("Images only!")
  }
}

// @route   GET /api/products
// @desc    Get all products with pagination and filtering
// @access  Public
router.get("/", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 12
    const skip = (page - 1) * limit

    // Build query
    const query = {}

    if (req.query.category && req.query.category !== "all") {
      query.category = req.query.category
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ]
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {}
      if (req.query.minPrice) query.price.$gte = Number.parseFloat(req.query.minPrice)
      if (req.query.maxPrice) query.price.$lte = Number.parseFloat(req.query.maxPrice)
    }

    if (req.query.rating) {
      query.rating = { $gte: Number.parseFloat(req.query.rating) }
    }

    // Sort options
    const sort = {}
    if (req.query.sort) {
      switch (req.query.sort) {
        case "price-low":
          sort.price = 1
          break
        case "price-high":
          sort.price = -1
          break
        case "rating":
          sort.rating = -1
          break
        case "newest":
          sort.createdAt = -1
          break
        default:
          sort.createdAt = -1
      }
    }

    const products = await Product.find(query).sort(sort).skip(skip).limit(limit)

    const total = await Product.countDocuments(query)

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8)
    res.json(products)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    console.error(error.message)
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Product not found" })
    }
    res.status(500).send("Server error")
  }
})

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post("/", [auth, admin], upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, category, brand, countInStock, featured, material, color, weight } = req.body

    const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : []

    const product = new Product({
      name,
      description,
      price: Number.parseFloat(price),
      category,
      brand,
      countInStock: Number.parseInt(countInStock),
      images,
      featured: featured === "true",
      material,
      color,
      weight: weight ? Number.parseFloat(weight) : undefined,
    })

    const createdProduct = await product.save()
    res.status(201).json(createdProduct)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put("/:id", [auth, admin], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })

    res.json(updatedProduct)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: "Product removed" })
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   POST /api/products/:id/reviews
// @desc    Create new review
// @access  Private
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString())

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" })
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    }

    product.reviews.push(review)
    product.numReviews = product.reviews.length
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save()
    res.status(201).json({ message: "Review added" })
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
