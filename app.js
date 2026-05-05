require('dotenv').config()

const express = require('express');
const sequelize = require('./common/database');
const authRoutes = require('./authorization/routes');
const userRoutes = require('./users/routes');
const productRoutes = require('./products/routes');
const cartRoutes = require('./cart/routes');
const paymentRoutes = require('./payment_service/routes');
const handleStripeWebhook = require('./payment_service/StripeWebHook');
const GlobalErrorHandler = require('./common/middlewares/ErrorHandler');
const helmet = require('helmet');
const cors = require('cors');
const { generalLimiter, authLimiter } = require('./common/middlewares/rateLimiters');

const app = express();

// Allow Cross-Origin requests
app.use(cors());

// Apply Helmet for basic security headers
app.use(helmet());

// Stripe Webhook MUST be placed BEFORE express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());

// Apply general rate limiter to all requests
app.use(generalLimiter);

// Import and use authorization routes (with strict rate limiting)
app.use('/auth', authLimiter, authRoutes);

// Import and use user routes
app.use('/users', userRoutes);

// Import and use product routes
app.use('/products', productRoutes);

// Import and use cart routes
app.use('/carts', cartRoutes);

// Import and use payment routes
app.use('/payments', paymentRoutes);


app.get('/status', (req, res) => {
    res.json({
        status: 'Running',
        timestamp: new Date().toISOString()
    });
});

// Global Error Handler - MUST be the last middleware
app.use(GlobalErrorHandler);

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

// Sync database in background
sequelize.sync({ alter: false })
    .then(() => console.log('Database synced successfully'))
    .catch(err => console.error('Database sync error:', err.message));

// Debug: Log why the process is exiting
process.on('exit', (code) => console.log(`Process exiting with code: ${code}`));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection at:', promise, 'reason:', reason));

// Keep the process alive
setInterval(() => {}, 1000 * 60 * 60);