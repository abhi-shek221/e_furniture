"use client"

import { createContext, useContext, useReducer, useEffect } from "react"

const CartContext = createContext()

const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
  shippingAddress: JSON.parse(localStorage.getItem("shippingAddress")) || {},
  paymentMethod: localStorage.getItem("paymentMethod") || "",
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const item = action.payload
      const existItem = state.cartItems.find((x) => x.product === item.product)

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) => (x.product === existItem.product ? item : x)),
        }
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        }
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x.product !== action.payload),
      }

    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.product === action.payload.product ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }

    case "CLEAR_CART":
      return {
        ...state,
        cartItems: [],
      }

    case "SAVE_SHIPPING_ADDRESS":
      return {
        ...state,
        shippingAddress: action.payload,
      }

    case "SAVE_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethod: action.payload,
      }

    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const cartItems = localStorage.getItem("cartItems")
    if (cartItems) {
      dispatch({
        type: "LOAD_CART",
        payload: JSON.parse(cartItems),
      })
    }
  }, [])

  // Add to cart
  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: {
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || "/placeholder.jpg",
        price: product.price,
        stock: product.stock,
        quantity,
      },
    })
  }

  // Remove from cart
  const removeFromCart = (productId) => {
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: productId,
    })
  }

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      dispatch({
        type: "UPDATE_CART_QUANTITY",
        payload: { product: productId, quantity },
      })
    }
  }

  // Clear cart
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  // Save shipping address
  const saveShippingAddress = (address) => {
    dispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: address,
    })
  }

  // Save payment method
  const savePaymentMethod = (method) => {
    dispatch({
      type: "SAVE_PAYMENT_METHOD",
      payload: method,
    })
  }

  // Calculate totals
  const itemsPrice = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const shippingPrice = itemsPrice > 100 ? 0 : 10
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2))
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2))

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(state.cartItems))
  }, [state.cartItems])

  useEffect(() => {
    localStorage.setItem("shippingAddress", JSON.stringify(state.shippingAddress))
  }, [state.shippingAddress])

  useEffect(() => {
    localStorage.setItem("paymentMethod", state.paymentMethod)
  }, [state.paymentMethod])

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveShippingAddress,
        savePaymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
