require('dotenv').config()

const express = require('express');
const supabase = require('./common/supabase');
const sequelize = require('./common/database');
const authRoutes = require('./authorization/routes');
const app = express();

app.use(express.json());

// Import and use authorization routes
app.use('/auth', authRoutes);

app.get('/status', (req, res) => {
    res.json({
        status: 'Running',
        timestamp: new Date().toISOString()
    });
});

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