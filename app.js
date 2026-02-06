require('dotenv').config()

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(express.json());

const supabaseInit = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/status', (req, res) => {
    res.json({
        status: 'Running',
        timestamp: new Date().toISOString()
    });
});

const PORT =process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));