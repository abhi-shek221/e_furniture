const express = require("express")
const User = require("../models/User")
const Product = require("../models/Product")
const { auth, admin } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get("/", [auth, admin], async (req, res) => {
  try {
    const users = await User.find({}).select("-password")
    res.json(users)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.phone = req.body.phone || user.phone
    user.address = req.body.address || user.address

    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   POST /api/users/wishlist/:id
// @desc    Add product to wishlist
// @access  Private
router.post("/wishlist/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const isAlreadyInWishlist = user.wishlist.find((item) => item.toString() === req.params.id)

    if (isAlreadyInWishlist) {
      return res.status(400).json({ message: "Product already in wishlist" })
    }

    user.wishlist.push(req.params.id)
    await user.save()

    res.json({ message: "Product added to wishlist" })
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   DELETE /api/users/wishlist/:id
// @desc    Remove product from wishlist
// @access  Private
router.delete("/wishlist/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    user.wishlist = user.wishlist.filter((item) => item.toString() !== req.params.id)

    await user.save()
    res.json({ message: "Product removed from wishlist" })
  } catch (error) {
    console.error(error.message)
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
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
