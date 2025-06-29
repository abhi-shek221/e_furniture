const express = require("express")
const { body, validationResult } = require("express-validator")
const Order = require("../models/Order")
const Product = require("../models/Product")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Create new order
router.post(
  "/",
  auth,
  [
    body("orderItems").isArray({ min: 1 }).withMessage("Order items are required"),
    body("shippingAddress.fullName").trim().isLength({ min: 1 }).withMessage("Full name is required"),
    body("shippingAddress.address").trim().isLength({ min: 1 }).withMessage("Address is required"),
    body("shippingAddress.city").trim().isLength({ min: 1 }).withMessage("City is required"),
    body("paymentMethod").isIn(["paypal", "stripe", "cod"]).withMessage("Invalid payment method"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body

      if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: "No order items" })
      }

      // Verify products exist and have sufficient stock
      for (const item of orderItems) {
        const product = await Product.findById(item.product)
        if (!product) {
          return res.status(404).json({ message: `Product ${item.name} not found` })
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          })
        }
      }

      const order = new Order({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      })

      const createdOrder = await order.save()

      // Update product stock and sales count
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: -item.quantity,
            salesCount: item.quantity,
          },
        })
      }

      res.status(201).json({
        message: "Order created successfully",
        order: createdOrder,
      })
    } catch (error) {
      console.error("Create order error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get user orders
router.get("/myorders", auth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("orderItems.product", "name images")

    const total = await Order.countDocuments({ user: req.user._id })

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
      },
    })
  } catch (error) {
    console.error("Get user orders error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get order by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name images")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(order)
  } catch (error) {
    console.error("Get order error:", error)
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Order not found" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// Update order to paid
router.put("/:id/pay", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    order.isPaid = true
    order.paidAt = Date.now()
    order.status = "processing"
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.update_time,
      emailAddress: req.body.payer?.email_address,
    }

    const updatedOrder = await order.save()

    res.json({
      message: "Order marked as paid",
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Update order payment error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all orders (Admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.status) {
      filter.status = req.query.status
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(filter)

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
      },
    })
  } catch (error) {
    console.error("Get all orders error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update order status (Admin only)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body

    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    order.status = status

    if (status === "delivered") {
      order.isDelivered = true
      order.deliveredAt = Date.now()
    }

    const updatedOrder = await order.save()

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
