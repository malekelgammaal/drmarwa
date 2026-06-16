require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
// Note: In a production app, we usually put HTML/CSS/JS in a 'public' folder.
// Since the structure is flat, we serve the root directory, but exclude node_modules.
app.use(express.static(__dirname, {
    index: ['index.html']
}));

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// 1. Signup Endpoint
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name || ''
            }
        }
    });

    if (error) return res.status(400).json({ error: error.message });

    // Supabase returns an empty identities array if the user already exists.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
        return res.status(400).json({ error: 'This account already exists. Please log in instead.' });
    }

    res.status(201).json({ message: 'Account created successfully!', user: data.user, session: data.session });
});

// 2. Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'Login successful', session: data.session });
});

// 3. OAuth Endpoint (Google / Facebook)
app.get('/api/auth/oauth', async (req, res) => {
    const { provider, redirect_to } = req.query;
    if (!provider) return res.status(400).json({ error: 'Provider is required' });
    
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: redirect_to || 'https://drmarwa.pages.dev/'
        }
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ url: data.url });
});

// ==========================================
// DATABASE ENDPOINTS
// ==========================================

// Get all posts from Supabase
app.get('/api/posts', async (req, res) => {
    try {
        // We assume you have a 'posts' table in Supabase
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('order_index', { ascending: true, nullsFirst: false })
            .order('id', { ascending: false });

        if (error) {
            console.error("Error fetching posts from DB:", error);
            // Fallback to dummy data if DB query fails (e.g. table doesn't exist yet)
            return res.json([
                { id: 1, title: 'Understanding CBT', excerpt: 'A brief introduction to Cognitive Behavioral Therapy.', date: '2026-05-01' },
                { id: 2, title: 'Emotional Regulation Techniques', excerpt: 'How to manage overwhelming emotions.', date: '2026-05-15' }
            ]);
        }

        // If no posts in DB yet, return the dummy data for now
        if (!data || data.length === 0) {
            return res.json([
                { id: 1, title: 'Understanding CBT', excerpt: 'A brief introduction to Cognitive Behavioral Therapy.', date: '2026-05-01' },
                { id: 2, title: 'Emotional Regulation Techniques', excerpt: 'How to manage overwhelming emotions.', date: '2026-05-15' }
            ]);
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all courses from Supabase
app.get('/api/courses', async (req, res) => {
    try {
        const { data, error } = await supabase.from('courses').select('*').order('order_index', { ascending: true, nullsFirst: false }).order('id', { ascending: true });

        if (error || !data || data.length === 0) {
            // Fallback — all 6 courses with updated prices
            return res.json([
                { id: 1, title: 'Tri-Therapy Bundle <br><small class="arabic-text medium">(باقة العلاج الثلاثي)</small>', price: 349.99, original_price: 425.00, discount_badge: 'Save 18%', image_url: 'images/course-tri-therapy.png', is_bundle: true, duration: '15 Days', excerpt: 'Complete mastery of evidence-based therapies for mental health professionals. Includes full access to DBT, CBT, and ACT clinical training.' },
                { id: 2, title: 'CBT Course <br><small class="arabic-text medium">(العلاج المعرفي السلوكي)</small>', price: 149.99, original_price: 200.00, discount_badge: 'Save 25%', image_url: 'images/course-cbt.png', is_bundle: false, duration: '5 Days', excerpt: 'Learn Cognitive Behavioral Therapy techniques to reframe negative thought patterns and overcome anxiety and depression.' },
                { id: 3, title: 'DBT Course <br><small class="arabic-text medium">(العلاج الجدلي السلوكي)</small>', price: 174.99, original_price: 225.00, discount_badge: 'Save 22%', image_url: 'images/course-dbt.png', is_bundle: false, duration: '5 Days', excerpt: 'Master Dialectical Behavior Therapy skills for mindfulness, emotional regulation, and distress tolerance.' },
                { id: 4, title: 'Personality Disorders Course <br><small class="arabic-text medium">(اضطرابات الشخصية)</small>', price: 174.99, original_price: 225.00, discount_badge: 'Save 22%', image_url: 'images/course-personality-disorders.png', is_bundle: false, duration: '5 Days', excerpt: 'An in-depth understanding of personality disorders and effective coping mechanisms for mental health professionals.' },
                { id: 5, title: 'ACT Course <br><small class="arabic-text medium">(العلاج بالقبول والالتزام)</small>', price: 149.99, original_price: 200.00, discount_badge: 'Save 25%', image_url: 'images/course-act.png', is_bundle: false, duration: '5 Days', excerpt: 'Acceptance & Commitment Therapy principles for living a value-driven life and increasing psychological flexibility.' },
                { id: 6, title: 'Healing Journey Program <br><small class="arabic-text medium">(رحلة تعافي)</small>', price: 99.99, original_price: 150.00, discount_badge: 'Save 33%', image_url: 'images/course-healing-journey.png', is_bundle: false, duration: '2 Days', excerpt: 'A comprehensive program designed to help you process trauma and build emotional resilience.' }
            ]);
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all testimonials from Supabase
app.get('/api/testimonials', async (req, res) => {
    try {
        const { data, error } = await supabase.from('testimonials').select('*').order('order_index', { ascending: true, nullsFirst: false }).order('id', { ascending: false });

        if (error || !data || data.length === 0) {
            return res.json([
                { id: 1, rating: 5, quote: "The CBT training provided me with invaluable clinical tools for my practice.", author: "Sarah M., Clinical Psychologist" },
                { id: 2, rating: 5, quote: "I took the Tri-Therapy bundle. Best investment ever for my career.", author: "Ahmed K." },
                { id: 3, rating: 5, quote: "Dr. Marwa has a way of explaining complex psychological concepts simply.", author: "Laila T." }
            ]);
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all sections from Supabase
app.get('/api/sections', async (req, res) => {
    try {
        const { data, error } = await supabase.from('sections').select('*').order('id', { ascending: true });

        if (error || !data || data.length === 0) {
            // Fallback to dummy data
            return res.json([
                { section_key: 'hero', title: 'Dr. Marwa Badr Ahmed', subtitle: 'Consultant & Trainer for Mental Health Professionals', content: 'Empowering psychologists and mental health professionals with advanced evidence-based practices (CBT, DBT, ACT) to elevate their clinical skills and therapeutic impact.', is_visible: true },
                { section_key: 'about', title: 'About Me', subtitle: '', content: '<p>I am a Mental Health Specialist and Trainer dedicated to elevating the standards of psychological practice. With extensive experience in clinical supervision and professional training, my mission is to equip psychologists with practical, evidence-based tools.</p><p>I specialize in training professionals in <strong>Cognitive Behavioral Therapy (CBT)</strong>, <strong>Dialectical Behavior Therapy (DBT)</strong>, and <strong>Acceptance & Commitment Therapy (ACT)</strong>. My programs focus on case formulation, advanced therapeutic techniques, and managing complex clinical cases.</p><p>Whether you are a newly graduated psychologist or an experienced practitioner, my courses and supervision sessions are designed to build your clinical confidence and enhance your therapeutic effectiveness.</p>', is_visible: true },
                { section_key: 'expertise', title: 'My Expertise', subtitle: '', content: '', is_visible: true },
                { section_key: 'courses', title: 'Professional Training Courses', subtitle: 'Advanced training programs designed specifically for mental health professionals.', content: '', is_visible: true },
                { section_key: 'contact', title: 'Get In Touch', subtitle: 'Have an inquiry regarding training or clinical supervision? Reach out below.', content: '', is_visible: true }
            ]);
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// --- REORDER HELPER ---
async function handleReorder(req, res, table) {
    const { items } = req.body; // Array of { id, order_index }
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Invalid items array' });
    
    try {
        const promises = items.map(item => 
            supabase.from(table).update({ order_index: item.order_index }).eq('id', item.id)
        );
        await Promise.all(promises);
        res.json({ message: 'Reordered successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
}

// --- POSTS ---
app.post('/api/posts', async (req, res) => {
    const { title, excerpt, content } = req.body;
    const { data, error } = await supabase.from('posts').insert([{ title, excerpt, content, date: new Date().toISOString() }]);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Post created successfully', data });
});

app.put('/api/posts/reorder', (req, res) => handleReorder(req, res, 'posts'));

app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, excerpt, content } = req.body;
    const { data, error } = await supabase.from('posts').update({ title, excerpt, content }).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Post updated successfully', data });
});

app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Post deleted successfully' });
});

// --- COURSES ---
app.post('/api/courses', async (req, res) => {
    const { title, price, original_price, discount_badge, duration, excerpt, is_bundle, image_url } = req.body;
    const { data, error } = await supabase.from('courses').insert([{ 
        title, price, original_price: original_price || null, discount_badge, duration, excerpt, is_bundle, image_url 
    }]);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Course created successfully', data });
});

app.put('/api/courses/reorder', (req, res) => handleReorder(req, res, 'courses'));

app.put('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { title, price, original_price, discount_badge, duration, excerpt, is_bundle, image_url } = req.body;
    const { data, error } = await supabase.from('courses').update({ 
        title, price, original_price: original_price || null, discount_badge, duration, excerpt, is_bundle, image_url 
    }).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Course updated successfully', data });
});

app.delete('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Course deleted successfully' });
});

// --- TESTIMONIALS ---
app.post('/api/testimonials', async (req, res) => {
    const { author, quote, rating } = req.body;
    const { data, error } = await supabase.from('testimonials').insert([{ author, quote, rating }]);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Testimonial created successfully', data });
});

app.put('/api/testimonials/reorder', (req, res) => handleReorder(req, res, 'testimonials'));

app.put('/api/testimonials/:id', async (req, res) => {
    const { id } = req.params;
    const { author, quote, rating } = req.body;
    const { data, error } = await supabase.from('testimonials').update({ author, quote, rating }).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Testimonial updated successfully', data });
});

app.delete('/api/testimonials/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Testimonial deleted successfully' });
});

// --- SECTIONS ---
app.put('/api/sections/:key', async (req, res) => {
    const { key } = req.params;
    const { title, subtitle, content, is_visible } = req.body;
    
    // Check if it exists
    const { data: existing, error: checkError } = await supabase.from('sections').select('*').eq('section_key', key).single();
    
    let error;
    if (!existing) {
        const { error: insertError } = await supabase.from('sections').insert([{ section_key: key, title, subtitle, content, is_visible }]);
        error = insertError;
    } else {
        const { error: updateError } = await supabase.from('sections').update({ title, subtitle, content, is_visible }).eq('section_key', key);
        error = updateError;
    }
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Section updated successfully' });
});

// ==========================================
// PAYMENT & ACCESS ENDPOINTS
// ==========================================

// Helper: extract and verify user JWT from Authorization header
async function getUserFromRequest(req) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return null;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// POST /api/record-purchase
// Called by frontend after payment gateway confirms payment.
// Saves purchase record to Supabase purchases table.
app.post('/api/record-purchase', async (req, res) => {
    try {
        // 1. Verify user identity from JWT
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized — please log in' });
        }

        const { course_id, transaction_id, amount_paid, currency } = req.body;

        // 2. Validate required fields
        if (!course_id || !transaction_id || !amount_paid) {
            return res.status(400).json({ error: 'Missing required fields: course_id, transaction_id, amount_paid' });
        }

        // 3. Prevent duplicate purchases (idempotent)
        const { data: existing } = await supabase
            .from('purchases')
            .select('id')
            .eq('transaction_id', transaction_id)
            .single();

        if (existing) {
            return res.status(200).json({ message: 'Purchase already recorded', already_exists: true });
        }

        // 4. Insert purchase record
        const { data, error } = await supabase
            .from('purchases')
            .insert([{
                user_id: user.id,
                course_id: course_id,
                transaction_id: transaction_id,
                amount_paid: amount_paid,
                currency: currency || 'USD',
                purchased_at: new Date().toISOString(),
                is_active: true
            }]);

        if (error) {
            console.error('[API] record-purchase DB error:', error);
            return res.status(500).json({ error: 'Failed to record purchase' });
        }

        console.log(`[API] ✅ Purchase recorded: user=${user.id} course=${course_id} txn=${transaction_id}`);
        res.status(201).json({ message: 'Purchase recorded successfully', data });

    } catch (err) {
        console.error('[API] record-purchase exception:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/check-access?course_id=cbt-course
// Called by course content pages on load to verify access.
// Returns { has_access: true/false }
app.get('/api/check-access', async (req, res) => {
    try {
        // 1. Verify user identity
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(200).json({ has_access: false, reason: 'not_logged_in' });
        }

        const { course_id } = req.query;
        if (!course_id) {
            return res.status(400).json({ error: 'Missing course_id query parameter' });
        }

        // 2. Check purchases table
        const { data, error } = await supabase
            .from('purchases')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', course_id)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return res.status(200).json({ has_access: false, reason: 'not_purchased' });
        }

        res.status(200).json({ has_access: true });

    } catch (err) {
        console.error('[API] check-access exception:', err);
        res.status(500).json({ has_access: false, error: 'Internal server error' });
    }
});

// GET /api/my-courses — returns all purchases for authenticated user
app.get('/api/my-courses', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { data, error } = await supabase
            .from('purchases')
            .select('course_id, purchased_at, amount_paid, currency, transaction_id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('purchased_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/forgot-password — sends Supabase password reset email
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://drmarwa.pages.dev/reset-password.html'
    });

    if (error && !error.message.includes('not found')) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'If this email is registered, a password reset link has been sent.' });
});

// POST /api/auth/verify-otp — verifies the 6-digit code sent to user email on signup
app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, token } = req.body;
    if (!email || !token) return res.status(400).json({ error: 'Email and code are required' });

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ session: data.session, user: data.user || data.session?.user });
});

// Fallback route to serve index.html for SPA-like behavior or if page not found
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`To start this server, run 'npm install' then 'node server.js'`);
});
