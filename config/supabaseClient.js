const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
    console.warn("⚠️ WARNING: Supabase URL or Key is missing or invalid in .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
