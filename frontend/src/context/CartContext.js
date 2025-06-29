"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.cartItems.find(
        (item) => item.product === action.payload.product
      );

      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item.product === action.payload.product
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
        };
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item.product !== action.payload
        ),
      };

    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.product === action.payload.product
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_CART":
      return {
        ...state,
        cartItems: [],
      };

    case "SAVE_SHIPPING_ADDRESS":
      return {
        ...state,
        shippingAddress: action.payload,
      };

    case "SAVE_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethod: action.payload,
      };

    case "ADD_TO_WISHLIST":
      const isInWishlist = state.wishlistItems.find(
        (item) => item.product === action.payload.product
      );

      if (!isInWishlist) {
        return {
          ...state,
          wishlistItems: [...state.wishlistItems, action.payload],
        };
      }
      return state;

    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        wishlistItems: state.wishlistItems.filter(
          (item) => item.product !== action.payload
        ),
      };

    case "LOAD_CART":
      return {
        ...state,
        cartItems: action.payload.cartItems || [],
        wishlistItems: action.payload.wishlistItems || [],
        shippingAddress: action.payload.shippingAddress || {
          fullName: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States",
          phone: "",
        },
        paymentMethod: action.payload.paymentMethod || "cod",
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: [],
    wishlistItems: [],
    shippingAddress: {
      fullName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phone: "",
    },
    paymentMethod: "cod",
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const cartItems = localStorage.getItem("cartItems");
      const wishlistItems = localStorage.getItem("wishlistItems");
      const shippingAddress = localStorage.getItem("shippingAddress");
      const paymentMethod = localStorage.getItem("paymentMethod");

      dispatch({
        type: "LOAD_CART",
        payload: {
          cartItems: cartItems ? JSON.parse(cartItems) : [],
          wishlistItems: wishlistItems ? JSON.parse(wishlistItems) : [],
          shippingAddress: shippingAddress
            ? JSON.parse(shippingAddress)
            : {
                fullName: "",
                address: "",
                city: "",
                state: "",
                zipCode: "",
                country: "United States",
                phone: "",
              },
          paymentMethod: paymentMethod || "cod",
        },
      });
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [state.cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "wishlistItems",
        JSON.stringify(state.wishlistItems)
      );
    } catch (error) {
      console.error("Error saving wishlist to localStorage:", error);
    }
  }, [state.wishlistItems]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "shippingAddress",
        JSON.stringify(state.shippingAddress)
      );
    } catch (error) {
      console.error("Error saving shipping address to localStorage:", error);
    }
  }, [state.shippingAddress]);

  useEffect(() => {
    try {
      localStorage.setItem("paymentMethod", state.paymentMethod);
    } catch (error) {
      console.error("Error saving payment method to localStorage:", error);
    }
  }, [state.paymentMethod]);

  const addToCart = (product, quantity = 1) => {
    const cartItem = {
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "/placeholder.svg",
      price: product.discountPrice || product.price,
      countInStock: product.countInStock,
      quantity: quantity,
    };

    dispatch({ type: "ADD_TO_CART", payload: cartItem });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
    toast.success("Item removed from cart!");
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    dispatch({
      type: "UPDATE_CART_QUANTITY",
      payload: { product: productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    toast.success("Cart cleared!");
  };

  const saveShippingAddress = (address) => {
    dispatch({ type: "SAVE_SHIPPING_ADDRESS", payload: address });
  };

  const savePaymentMethod = (method) => {
    dispatch({ type: "SAVE_PAYMENT_METHOD", payload: method });
  };

  const addToWishlist = (product) => {
    const wishlistItem = {
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "/placeholder.svg",
      price: product.discountPrice || product.price,
    };

    dispatch({ type: "ADD_TO_WISHLIST", payload: wishlistItem });
    toast.success(`${product.name} added to wishlist!`);
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId });
    toast.success("Item removed from wishlist!");
  };

  const isInWishlist = (productId) => {
    return state.wishlistItems.some((item) => item.product === productId);
  };

  // Calculate cart totals
  const itemsPrice = state.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const value = {
    cartItems: state.cartItems,
    wishlistItems: state.wishlistItems,
    shippingAddress: state.shippingAddress,
    paymentMethod: state.paymentMethod,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    saveShippingAddress,
    savePaymentMethod,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
