require('dotenv').config()

const express = require('express');
const sequelize = require('./common/database');
const authRoutes = require('./authorization/routes');
const userRoutes = require('./users/routes');
const app = express();

app.use(express.json());

// Import and use authorization routes
app.use('/auth', authRoutes);

// Import and use user routes
app.use('/users', userRoutes);

const productRoutes = require('./products/routes');
const GlobalErrorHandler = require('./common/middlewares/ErrorHandler');

app.use('/', productRoutes);

app.get('/status', (req, res) => {
    res.json({
        status: 'Running',
        timestamp: new Date().toISOString()
    });
});

// Global Error Handler - MUST be the last middleware
app.use(GlobalErrorHandler);

const PORT = process.env.PORT || 3000;

// Sync database and start server
sequelize.sync({ alter: false })
    .then(() => {
        console.log('Database synced successfully');
    })
    .catch(err => {
        console.error('Database sync error:', err.message);
        console.warn('Server starting, but Database is NOT connected (check your .env placeholders).');
    })
    .finally(() => {
        app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
    });