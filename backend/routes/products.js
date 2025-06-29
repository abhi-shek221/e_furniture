const express = require("express")
const multer = require("multer")
const path = require("path")
const Product = require("../models/Product")
const { body, validationResult } = require("express-validator")
const { auth, adminAuth } = require("../middleware/auth")

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

    // Build filter object
    const filter = {}

    if (req.query.category) {
      filter.category = req.query.category
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { tags: { $in: [new RegExp(req.query.search, "i")] } },
      ]
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {}
      if (req.query.minPrice) filter.price.$gte = Number.parseFloat(req.query.minPrice)
      if (req.query.maxPrice) filter.price.$lte = Number.parseFloat(req.query.maxPrice)
    }

    if (req.query.inStock === "true") {
      filter.stock = { $gt: 0 }
      filter.isAvailable = true
    }

    // Build sort object
    const sort = {}
    switch (req.query.sortBy) {
      case "price_asc":
        sort.price = 1
        break
      case "price_desc":
        sort.price = -1
        break
      case "rating":
        sort.rating = -1
        break
      case "newest":
        sort.createdAt = -1
        break
      case "popular":
        sort.salesCount = -1
        break
      default:
        sort.createdAt = -1
    }

    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit).select("-reviews")

    const total = await Product.countDocuments(filter)

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isAvailable: true })
      .limit(8)
      .select("-reviews")
      .sort({ createdAt: -1 })

    res.json(products)
  } catch (error) {
    console.error("Get featured products error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/products/categories
// @desc    Get product categories
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category")
    res.json(categories)
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Server error" })
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
    console.error("Get product error:", error)
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Product not found" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post(
  "/",
  adminAuth,
  [
    body("name").trim().isLength({ min: 1 }).withMessage("Product name is required"),
    body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("category")
      .isIn(["sofa", "chair", "table", "bed", "cabinet", "desk", "bookshelf", "other"])
      .withMessage("Invalid category"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const product = new Product(req.body)
      await product.save()

      res.status(201).json({
        message: "Product created successfully",
        product,
      })
    } catch (error) {
      console.error("Create product error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({
      message: "Product updated successfully",
      product,
    })
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/products/:id/reviews
// @desc    Create new review
// @access  Private
router.post(
  "/:id/reviews",
  auth,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").trim().isLength({ min: 1 }).withMessage("Comment is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const product = await Product.findById(req.params.id)
      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      // Check if user already reviewed this product
      const existingReview = product.reviews.find((review) => review.user.toString() === req.user._id.toString())

      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" })
      }

      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number.parseInt(req.body.rating),
        comment: req.body.comment,
      }

      product.reviews.push(review)
      product.calculateAverageRating()
      await product.save()

      res.status(201).json({
        message: "Review added successfully",
        review,
      })
    } catch (error) {
      console.error("Add review error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
