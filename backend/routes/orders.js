const express = require("express")
const Order = require("../models/Order")
const Product = require("../models/Product")
const { auth, admin } = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" })
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    })

    const createdOrder = await order.save()

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product)
      if (product) {
        product.countInStock -= item.quantity
        await product.save()
      }
    }

    res.status(201).json(createdOrder)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   GET /api/orders
// @desc    Get logged in user orders
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   GET /api/orders/all
// @desc    Get all orders
// @access  Private/Admin
router.get("/all", [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized to view this order" })
    }

    res.json(order)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put("/:id/pay", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    }

    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
router.put("/:id/deliver", [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    order.isDelivered = true
    order.deliveredAt = Date.now()
    order.status = "delivered"

    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put("/:id/status", [auth, admin], async (req, res) => {
  try {
    const { status } = req.body
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
    res.json(updatedOrder)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
