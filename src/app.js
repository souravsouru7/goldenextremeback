const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Load env vars
dotenv.config();

// Initialize express
const app = express();

// CORS middleware
app.use(cors({
    origin: ['https://www.goldenextreme.com', 'https://goldenextreme.com',"http://localhost:3001"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    exposedHeaders: ['Authorization']
}));

// Add OPTIONS handling
app.options('*', cors());

// Middleware with increased limits
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Connect to Database
connectDB();

// Serve static files
app.use('/uploads', express.static('public/uploads'));

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const contactRoutes = require('./routes/contactRoutes');
const eventRoutes = require('./routes/eventRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/events', eventRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});