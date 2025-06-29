const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const Product = require("../models/Product")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get("/", adminAuth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const users = await User.find({}).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await User.countDocuments()

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).send("Server error")
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  auth,
  [
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").optional().isEmail().withMessage("Please enter a valid email"),
    body("phone").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, email, phone, address } = req.body

      // Check if email is already taken by another user
      if (email && email !== req.user.email) {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          return res.status(400).json({ message: "Email is already taken" })
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(address && { address }),
        },
        { new: true, runValidators: true },
      ).select("-password")

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).send("Server error")
    }
  },
)

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put(
  "/change-password",
  auth,
  [
    body("currentPassword").exists().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { currentPassword, newPassword } = req.body

      const user = await User.findById(req.user._id)

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" })
      }

      // Update password
      user.password = newPassword
      await user.save()

      res.json({ message: "Password changed successfully" })
    } catch (error) {
      console.error("Change password error:", error)
      res.status(500).send("Server error")
    }
  },
)

// @route   POST /api/users/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post("/wishlist/:productId", auth, async (req, res) => {
  try {
    const productId = req.params.productId

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const user = await User.findById(req.user._id)

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" })
    }

    user.wishlist.push(productId)
    await user.save()

    res.json({ message: "Product added to wishlist" })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    res.status(500).send("Server error")
  }
})

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete("/wishlist/:productId", auth, async (req, res) => {
  try {
    const productId = req.params.productId

    const user = await User.findById(req.user._id)
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId)
    await user.save()

    res.json({ message: "Product removed from wishlist" })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    res.status(500).send("Server error")
  }
})

// @route   GET /api/users/wishlist
// @desc    Get user wishlist
// @access  Private
router.get("/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist")
    res.json(user.wishlist)
  } catch (error) {
    console.error("Get wishlist error:", error)
    res.status(500).send("Server error")
  }
})

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: "Cannot delete admin user" })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).send("Server error")
  }
})

module.exports = router
