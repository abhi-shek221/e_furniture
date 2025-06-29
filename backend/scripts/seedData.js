const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Product = require("../models/Product");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/furniture-ecommerce"
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const users = [
  {
    name: "Admin User",
    email: "admin@furniture.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "user",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "user",
  },
];

const products = [
  {
    name: "Modern Sectional Sofa",
    description:
      "Comfortable and stylish sectional sofa perfect for modern living rooms. Features premium fabric upholstery and sturdy wooden frame.",
    price: 1299,
    originalPrice: 1599,
    category: "sofa",
    brand: "ComfortHome",
    images: [
      {
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        alt: "Modern Sectional Sofa",
      },
    ],
    stock: 15,
    rating: 4.5,
    numReviews: 23,
    isFeatured: true,
    material: "Fabric",
    color: "Gray",
    dimensions: {
      length: 240,
      width: 160,
      height: 85,
      weight: 75,
    },
  },
  {
    name: "Ergonomic Office Chair",
    description:
      "Professional ergonomic office chair with lumbar support and adjustable height. Perfect for long working hours.",
    price: 299,
    originalPrice: 399,
    category: "chair",
    brand: "WorkWell",
    images: [
      {
        url: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=400&fit=crop",
        alt: "Ergonomic Office Chair",
      },
    ],
    stock: 25,
    rating: 4.3,
    numReviews: 18,
    isFeatured: true,
    material: "Mesh",
    color: "Black",
    dimensions: {
      length: 65,
      width: 65,
      height: 120,
      weight: 18,
    },
  },
  {
    name: "Solid Wood Dining Table",
    description:
      "Beautiful solid oak dining table that seats 6 people comfortably. Handcrafted with attention to detail.",
    price: 899,
    category: "table",
    brand: "WoodCraft",
    images: [
      {
        url: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop",
        alt: "Solid Wood Dining Table",
      },
    ],
    stock: 8,
    rating: 4.8,
    numReviews: 12,
    isFeatured: true,
    material: "Oak Wood",
    color: "Natural",
    dimensions: {
      length: 180,
      width: 90,
      height: 75,
      weight: 45,
    },
  },
  {
    name: "Queen Size Platform Bed",
    description:
      "Minimalist platform bed with built-in nightstands. Made from sustainable bamboo with a natural finish.",
    price: 699,
    originalPrice: 899,
    category: "bed",
    brand: "EcoSleep",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop",
        alt: "Queen Size Platform Bed",
      },
    ],
    stock: 12,
    rating: 4.6,
    numReviews: 15,
    isFeatured: true,
    material: "Bamboo",
    color: "Natural",
    dimensions: {
      length: 215,
      width: 165,
      height: 35,
      weight: 55,
    },
  },
  {
    name: "Modern TV Cabinet",
    description:
      "Sleek TV cabinet with ample storage space for media devices and accessories. Features cable management system.",
    price: 449,
    category: "cabinet",
    brand: "MediaMax",
    images: [
      {
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        alt: "Modern TV Cabinet",
      },
    ],
    stock: 18,
    rating: 4.2,
    numReviews: 9,
    material: "MDF",
    color: "White",
    dimensions: {
      length: 150,
      width: 40,
      height: 50,
      weight: 25,
    },
  },
  {
    name: "Standing Desk Converter",
    description:
      "Adjustable standing desk converter that transforms any desk into a standing workstation. Promotes better posture and health.",
    price: 199,
    originalPrice: 249,
    category: "desk",
    brand: "HealthDesk",
    images: [
      {
        url: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=400&fit=crop",
        alt: "Standing Desk Converter",
      },
    ],
    stock: 30,
    rating: 4.4,
    numReviews: 21,
    isFeatured: true,
    material: "Steel",
    color: "Black",
    dimensions: {
      length: 80,
      width: 60,
      height: 50,
      weight: 12,
    },
  },
  {
    name: "Leather Recliner Chair",
    description:
      "Luxurious leather recliner chair with massage function and cup holders. Perfect for relaxation after a long day.",
    price: 1199,
    category: "chair",
    brand: "LuxuryLiving",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop",
        alt: "Leather Recliner Chair",
      },
    ],
    stock: 6,
    rating: 4.7,
    numReviews: 8,
    material: "Leather",
    color: "Brown",
    dimensions: {
      length: 90,
      width: 95,
      height: 105,
      weight: 42,
    },
  },
  {
    name: "Glass Coffee Table",
    description:
      "Elegant glass coffee table with chrome legs. Adds a modern touch to any living room while maintaining an open feel.",
    price: 349,
    category: "table",
    brand: "GlassWorks",
    images: [
      {
        url: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop",
        alt: "Glass Coffee Table",
      },
    ],
    stock: 14,
    rating: 4.1,
    numReviews: 11,
    isFeatured: true,
    material: "Tempered Glass",
    color: "Clear",
    dimensions: {
      length: 120,
      width: 60,
      height: 45,
      weight: 22,
    },
  },
];

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log("Existing data cleared");

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created`);

    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products created`);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

connectDB().then(() => {
  seedData();
});
