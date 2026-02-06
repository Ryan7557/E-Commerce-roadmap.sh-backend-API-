const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

// Check if variables are missing or still set to placeholders
const isConfigured =
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== 'your_supabase_url' &&
    supabaseKey !== 'your_supabase_anon_key' &&
    supabaseUrl.startsWith('http');

if (isConfigured) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('Supabase initialized successfully');
    } catch (error) {
        console.error('Error initializing Supabase client:', error.message);
    }
} else {
    console.warn('Supabase is not configured. Some features (like image uploads) will be disabled.');
}

module.exports = supabase;
