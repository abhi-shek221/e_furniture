# Furniture E-commerce Website - MERN Stack

A full-stack furniture e-commerce website built with MongoDB, Express.js, React.js, and Node.js.

## Features

### Frontend (React.js)
- Responsive homepage with hero banner and featured products
- Product listing page with categories and filters
- Product detail page with images, description, price, rating, and reviews
- Search functionality with advanced filters
- Shopping cart with persistent storage
- Checkout process
- User authentication (login/register)
- User dashboard (profile, orders, wishlist)
- Admin dashboard for managing products, users, and orders

### Backend (Node.js + Express.js)
- RESTful API for products, users, orders, and authentication
- JWT-based authentication
- CRUD operations for product management
- Order processing with status updates
- File upload for product images
- Input validation and error handling

### Database (MongoDB)
- User management with roles (user/admin)
- Product catalog with categories and reviews
- Order management with detailed tracking
- Wishlist functionality

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd furniture-ecommerce
\`\`\`

2. Install backend dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update the .env file with your configuration:
\`\`\`
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/furniture-ecommerce
JWT_SECRET=your_jwt_secret_key_here
\`\`\`

5. Create uploads directory:
\`\`\`bash
mkdir backend/uploads
\`\`\`

6. Start the backend server:
\`\`\`bash
npm run server
\`\`\`

### Frontend Setup

1. Navigate to frontend directory and install dependencies:
\`\`\`bash
cd frontend
npm install
\`\`\`

2. Start the React development server:
\`\`\`bash
npm start
\`\`\`

### Running Both Frontend and Backend

From the root directory:
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Products
- GET /api/products - Get all products (with pagination and filters)
- GET /api/products/featured - Get featured products
- GET /api/products/:id - Get single product
- POST /api/products - Create product (Admin only)
- PUT /api/products/:id - Update product (Admin only)
- DELETE /api/products/:id - Delete product (Admin only)
- POST /api/products/:id/reviews - Add product review

### Orders
- POST /api/orders - Create new order
- GET /api/orders - Get user orders
- GET /api/orders/all - Get all orders (Admin only)
- GET /api/orders/:id - Get order by ID
- PUT /api/orders/:id/pay - Update order to paid
- PUT /api/orders/:id/deliver - Update order to delivered (Admin only)

### Users
- GET /api/users - Get all users (Admin only)
- PUT /api/users/profile - Update user profile
- POST /api/users/wishlist/:id - Add to wishlist
- DELETE /api/users/wishlist/:id - Remove from wishlist
- GET /api/users/wishlist - Get user wishlist

## Default Admin Account

To create an admin account, you can either:

1. Register a normal account and manually update the role in MongoDB:
\`\`\`javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
\`\`\`

2. Or modify the registration endpoint temporarily to create an admin account.

## Project Structure

\`\`\`
furniture-ecommerce/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.js
│   └── public/
├── .env
├── package.json
└── README.md
\`\`\`

## Technologies Used

- **Frontend**: React.js, React Router, Context API, Axios
- **Backend**: Node.js, Express.js, JWT, Multer, bcryptjs
- **Database**: MongoDB, Mongoose
- **Styling**: CSS3, Responsive Design

## Features in Detail

### User Features
- Browse products by category
- Search and filter products
- View detailed product information
- Add products to cart and wishlist
- User registration and authentication
- Place orders and track order status
- Leave product reviews and ratings
- Manage user profile

### Admin Features
- Add, edit, and delete products
- Upload product images
- Manage user accounts
- View and update order status
- Dashboard with overview statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
