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
app.use(express.json({ limit: '10mb' }));

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
            redirectTo: redirect_to || 'https://drmarwabadr.vercel.app/'
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
            // Fallback — all 6 courses with updated prices (EGP)
            return res.json([
                { id: 1, title: 'Tri-Therapy Bundle <br><small class="arabic-text medium">(باقة العلاج الثلاثي)</small>', price: 17500, original_price: 21500, discount_badge: 'Save 18%', image_url: 'images/course-tri-therapy.png', is_bundle: true, duration: '15 Days', excerpt: 'Complete mastery of evidence-based therapies for mental health professionals. Includes full access to DBT, CBT, and ACT clinical training.' },
                { id: 2, title: 'CBT Course <br><small class="arabic-text medium">(العلاج المعرفي السلوكي)</small>', price: 7500, original_price: 10000, discount_badge: 'Save 25%', image_url: 'images/course-cbt.png', is_bundle: false, duration: '5 Days', excerpt: 'Learn Cognitive Behavioral Therapy techniques to reframe negative thought patterns and overcome anxiety and depression.' },
                { id: 3, title: 'DBT Course <br><small class="arabic-text medium">(العلاج الجدلي السلوكي)</small>', price: 8500, original_price: 11500, discount_badge: 'Save 26%', image_url: 'images/course-dbt.png', is_bundle: false, duration: '5 Days', excerpt: 'Master Dialectical Behavior Therapy skills for mindfulness, emotional regulation, and distress tolerance.' },
                { id: 4, title: 'Personality Disorders Course <br><small class="arabic-text medium">(اضطرابات الشخصية)</small>', price: 8500, original_price: 11500, discount_badge: 'Save 26%', image_url: 'images/course-personality-disorders.png', is_bundle: false, duration: '5 Days', excerpt: 'An in-depth understanding of personality disorders and effective coping mechanisms for mental health professionals.' },
                { id: 5, title: 'ACT Course <br><small class="arabic-text medium">(العلاج بالقبول والالتزام)</small>', price: 7500, original_price: 10000, discount_badge: 'Save 25%', image_url: 'images/course-act.png', is_bundle: false, duration: '5 Days', excerpt: 'Acceptance & Commitment Therapy principles for living a value-driven life and increasing psychological flexibility.' },
                { id: 6, title: 'Healing Journey Program <br><small class="arabic-text medium">(رحلة تعافي)</small>', price: 5000, original_price: 7500, discount_badge: 'Save 33%', image_url: 'images/course-healing-journey.png', is_bundle: false, duration: '2 Days', excerpt: 'A comprehensive program designed to help you process trauma and build emotional resilience.' }
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

// Admin endpoints removed. Data management will be handled directly via Supabase Dashboard.

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

// Hardcoded course prices for backend validation (Prevents client spoofing)
const COURSE_PRICES = {
    'healing-journey-program': { price: 5000, currency: 'EGP' },
    'dbt-course': { price: 8500, currency: 'EGP' },
    'cbt-course': { price: 7500, currency: 'EGP' },
    'act-course': { price: 7500, currency: 'EGP' },
    'personality-disorders-course': { price: 8500, currency: 'EGP' },
    'tri-therapy-bundle': { price: 17500, currency: 'EGP' }
};

// POST /api/record-purchase
// Called by frontend after payment gateway confirms payment.
// Saves purchase record to Supabase purchases table.
app.post('/api/record-purchase', async (req, res) => {
    try {
        // 1. Verify user identity from JWT
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized - please log in' });
        }

        const { course_id, transaction_id } = req.body;

        // 2. Validate required fields
        if (!course_id || !transaction_id) {
            return res.status(400).json({ error: 'Missing required fields: course_id, transaction_id' });
        }

        // 3. SECURE PRICE LOOKUP (Ignores client's amount_paid)
        const courseInfo = COURSE_PRICES[course_id];
        if (!courseInfo) {
            return res.status(400).json({ error: 'Invalid course ID' });
        }

        const secureAmountPaid = courseInfo.price;
        const secureCurrency = courseInfo.currency;

        // 4. Prevent duplicate purchases (idempotent)
        const { data: existing } = await supabase
            .from('purchases')
            .select('id')
            .eq('transaction_id', transaction_id)
            .single();

        if (existing) {
            return res.status(200).json({ message: 'Purchase already recorded', already_exists: true });
        }

        // 5. Insert purchase record
        const { data, error } = await supabase
            .from('purchases')
            .insert([{
                user_id: user.id,
                course_id: course_id,
                transaction_id: transaction_id,
                amount_paid: secureAmountPaid,
                currency: secureCurrency,
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

// POST /api/instapay-request
// Called by frontend when user submits an InstaPay manual request.
// Saves purchase record as is_active = false for admin manual review.
app.post('/api/instapay-request', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized - please log in' });

        const { course_id, username, whatsapp, base64_receipt } = req.body;
        if (!course_id) return res.status(400).json({ error: 'Missing course_id' });

        const courseInfo = COURSE_PRICES[course_id];
        if (!courseInfo) return res.status(400).json({ error: 'Invalid course ID' });

        const secureAmountPaid = courseInfo.price;
        const secureCurrency = courseInfo.currency;
        
        // Upload receipt to Supabase Storage if provided
        let receiptUrl = null;
        if (base64_receipt) {
            const matches = base64_receipt.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const contentType = matches[1];
                const buffer = Buffer.from(matches[2], 'base64');
                const filename = `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}.${contentType.split('/')[1] || 'jpg'}`;
                
                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('receipts')
                    .upload(filename, buffer, { contentType, upsert: true });

                if (!uploadError) {
                    const { data } = supabase.storage.from('receipts').getPublicUrl(filename);
                    receiptUrl = data.publicUrl;
                } else {
                    console.error('[API] Failed to upload receipt:', uploadError);
                }
            }
        }
        
        // Use a unique placeholder transaction ID for manual requests
        const transaction_id = 'instapay-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        const { data, error } = await supabase
            .from('purchases')
            .insert([{
                user_id: user.id,
                course_id: course_id,
                transaction_id: transaction_id,
                amount_paid: secureAmountPaid,
                currency: secureCurrency,
                purchased_at: new Date().toISOString(),
                is_active: false // Critical: Requires Admin Manual Verification
            }]);

        if (error) {
            console.error('[API] instapay-request DB error:', error);
            return res.status(500).json({ error: 'Failed to record request' });
        }

        console.log(`[API] 🟡 Pending InstaPay request: user=${user.id} course=${course_id} txn=${transaction_id}`);
        res.status(201).json({ message: 'Request recorded successfully. Pending admin approval.', data, receipt_url: receiptUrl });

    } catch (err) {
        console.error('[API] instapay-request exception:', err);
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
