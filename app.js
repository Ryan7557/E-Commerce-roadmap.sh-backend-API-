require('dotenv').config()

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const sequelize = require('./common/database');
const authRoutes = require('./authorization/routes');
const app = express();

app.use(express.json());

const supabaseInit = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
sequelize.sync({ alter: false }).then(() => {
    console.log('Database synced successfully');
    app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
}).catch(err => {
    console.error('Database sync error:', err.message);
    process.exit(1);
});