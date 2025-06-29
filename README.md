# Furniture E-commerce Website

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce website for furniture shopping.

## Features

### Customer Features
- **User Authentication**: Register, login, and profile management
- **Product Browsing**: Browse products by category, search, and filter
- **Product Details**: Detailed product pages with images, descriptions, and reviews
- **Shopping Cart**: Add/remove items, update quantities
- **Wishlist**: Save favorite products for later
- **Checkout Process**: Secure checkout with multiple payment options
- **Order Management**: View order history and track order status
- **Product Reviews**: Rate and review purchased products

### Admin Features
- **Admin Dashboard**: Overview of sales, orders, and users
- **Product Management**: Add, edit, and delete products
- **Order Management**: View and update order status
- **User Management**: View and manage customer accounts
- **Inventory Management**: Track stock levels

### Technical Features
- **Responsive Design**: Mobile-first design that works on all devices
- **RESTful API**: Clean and organized backend API
- **JWT Authentication**: Secure user authentication
- **Image Upload**: Product image management
- **Search & Filtering**: Advanced product search and filtering
- **Pagination**: Efficient data loading with pagination
- **Error Handling**: Comprehensive error handling and validation

## Technology Stack

### Frontend
- **React.js**: User interface library
- **React Router**: Client-side routing
- **Context API**: State management
- **Axios**: HTTP client for API requests
- **React Toastify**: Toast notifications
- **React Icons**: Icon library
- **CSS3**: Styling with custom CSS

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **Multer**: File upload handling
- **Express Validator**: Input validation

## Project Structure

\`\`\`
furniture-ecommerce/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── users.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── ProductCard.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── AdminRoute.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── CartContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Products.js
│   │   │   ├── ProductDetail.js
│   │   │   ├── Cart.js
│   │   │   ├── Checkout.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Profile.js
│   │   │   ├── Orders.js
│   │   │   ├── OrderDetail.js
│   │   │   ├── Wishlist.js
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.js
│   │   │       ├── AdminProducts.js
│   │   │       ├── AdminOrders.js
│   │   │       └── AdminUsers.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json
└── README.md
\`\`\`

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a `.env` file in the backend directory:
\`\`\`env
MONGO_URI=mongodb://localhost:27017/furniture-ecommerce
JWT_SECRET=your_jwt_secret_key
PORT=5000
\`\`\`

4. Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
\`\`\`bash
cd frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a `.env` file in the frontend directory:
\`\`\`env
REACT_APP_API_URL=http://localhost:5000/api
\`\`\`

4. Start the frontend development server:
\`\`\`bash
npm start
\`\`\`

The frontend will run on `http://localhost:3000`

### Full Stack Setup

You can also run both frontend and backend simultaneously from the root directory:

1. Install root dependencies:
\`\`\`bash
npm install
\`\`\`

2. Install all dependencies:
\`\`\`bash
npm run install-all
\`\`\`

3. Start both servers:
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filtering and pagination)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `POST /api/products/:id/reviews` - Add product review

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `POST /api/users/wishlist/:productId` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist
- `GET /api/users/wishlist` - Get user wishlist
- `GET /api/users` - Get all users (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## Environment Variables

### Backend (.env)
\`\`\`env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
\`\`\`

### Frontend (.env)
\`\`\`env
REACT_APP_API_URL=http://localhost:5000/api
\`\`\`

## Demo Accounts

### Admin Account
- Email: admin@furniture.com
- Password: admin123

### Customer Account
- Email: customer@furniture.com
- Password: customer123

## Features in Detail

### User Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes for authenticated users
- Admin-only routes for administrative functions

### Product Management
- CRUD operations for products
- Image upload and management
- Category-based organization
- Search and filtering capabilities
- Stock management
- Featured products

### Shopping Cart
- Add/remove products
- Update quantities
- Persistent cart using localStorage
- Real-time price calculations
- Tax and shipping calculations

### Order Management
- Complete checkout process
- Multiple payment methods (COD, PayPal, Stripe simulation)
- Order status tracking
- Order history for users
- Admin order management

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@furniturestore.com or create an issue in the repository.

## Acknowledgments

- React.js community for excellent documentation
- MongoDB for the flexible database solution
- Express.js for the robust backend framework
- All contributors who helped improve this project
