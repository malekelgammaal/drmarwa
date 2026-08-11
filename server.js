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
const SITE_URL = (process.env.SITE_URL || 'https://drmarwa.pages.dev').replace(/\/+$/, '');

// Public pages live beside server and maintenance files. Keep the static surface
// explicit so source files and local configuration cannot be downloaded.
const PUBLIC_ROOT_FILES = new Set([
    'index.html', 'blog.html', 'checkout.html', 'course-act-course.html',
    'course-cbt-course.html', 'course-dbt-course.html', 'course-detail.html',
    'course-healing-journey-program.html', 'course-personality-disorders-course.html',
    'course-tri-therapy-bundle.html', 'my-courses.html', 'payment-success.html',
    'privacy-policy.html', 'profile.html', 'refund-policy.html',
    'reset-password.html', 'terms.html'
]);
const PUBLIC_DIRECTORIES = new Set(['css', 'fonts', 'images', 'js']);

function isPublicStaticRequest(req) {
    if (!['GET', 'HEAD'].includes(req.method) || req.path.startsWith('/api/')) return true;

    let requestedPath;
    try {
        requestedPath = decodeURIComponent(req.path).replace(/^\/+/, '');
    } catch {
        return false;
    }

    if (!requestedPath) return true;
    const segments = requestedPath.split('/');
    if (segments.some(segment => !segment || segment === '.' || segment === '..')) return false;
    if (segments.length === 1) return PUBLIC_ROOT_FILES.has(segments[0]);
    return PUBLIC_DIRECTORIES.has(segments[0]);
}

function decodeImageDataUrl(value, allowedTypes, maxBytes) {
    if (typeof value !== 'string') return null;
    const matches = value.match(/^data:([A-Za-z-+/]+);base64,([A-Za-z0-9+/=]+)$/);
    if (!matches || !allowedTypes.includes(matches[1])) return null;

    const buffer = Buffer.from(matches[2], 'base64');
    if (!buffer.length || buffer.length > maxBytes) return null;
    return { contentType: matches[1], buffer };
}

// Middleware
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (!isPublicStaticRequest(req)) return res.status(404).send('Not found');
    next();
});

// Serve only the explicitly public portion of the project directory.
app.use(express.static(__dirname, {
    dotfiles: 'deny',
    index: ['index.html']
}));

// ==========================================
// AUTHORITATIVE COURSE CATALOG
// Single source of truth for all course data
// ==========================================
// STATIC COURSE DATA (Merged with DB dynamically)
const COURSE_CATALOG = {
    'tri-therapy-bundle': {
        name_ar: 'باقة العلاج الثلاثي',
        name_en: 'Tri-Therapy Bundle',
        description: 'Complete mastery of evidence-based therapies for mental health professionals. Includes full access to DBT, CBT, and ACT clinical training — a comprehensive system for transforming your therapeutic practice.',
        curriculum: [
            'Advanced DBT skills: Mindfulness, Distress Tolerance, Emotional Regulation, Interpersonal Effectiveness',
            'Complete CBT framework: Cognitive Restructuring, Behavioral Activation, Schema Work',
            'ACT mastery: Psychological Flexibility, Values Clarification, Committed Action',
            'Integration of all three modalities for complex cases',
            'Case formulation across all three frameworks',
            'Clinical supervision techniques'
        ],
        target_audience: 'Mental health professionals seeking comprehensive training in evidence-based therapies',
        prerequisites: 'Basic psychology background or clinical experience recommended'
    },
    'cbt-course': {
        name_ar: 'العلاج المعرفي السلوكي',
        name_en: 'Cognitive Behavioral Therapy (CBT)',
        description: 'Learn Cognitive Behavioral Therapy techniques to reframe negative thought patterns and overcome anxiety and depression. A structured, evidence-based approach used by therapists worldwide.',
        curriculum: [
            'Foundations of CBT: Theory and evidence base',
            'Cognitive Restructuring techniques',
            'Behavioral Activation strategies',
            'Identifying and challenging cognitive distortions',
            'Schema therapy integration',
            'CBT for anxiety, depression, and OCD',
            'Case formulation using CBT framework',
            'Homework and between-session exercises'
        ],
        target_audience: 'Psychologists, therapists, counselors, and mental health students',
        prerequisites: 'No prior therapy training required'
    },
    'dbt-course': {
        name_ar: 'العلاج الجدلي السلوكي',
        name_en: 'Dialectical Behavior Therapy (DBT)',
        description: 'Master Dialectical Behavior Therapy skills for mindfulness, emotional regulation, and distress tolerance. The most effective treatment for borderline personality disorder and emotional dysregulation.',
        curriculum: [
            'DBT biosocial theory and dialectical philosophy',
            'Core Mindfulness skills module',
            'Distress Tolerance skills and crisis survival',
            'Emotional Regulation: understanding and changing emotions',
            'Interpersonal Effectiveness skills',
            'DBT for BPD and emotional dysregulation',
            'Individual therapy + skills group structure',
            'Chain analysis and diary cards'
        ],
        target_audience: 'Therapists working with emotionally dysregulated clients, BPD, and self-harm',
        prerequisites: 'Basic counseling or therapy background recommended'
    },
    'act-course': {
        name_ar: 'العلاج بالقبول والالتزام',
        name_en: 'Acceptance & Commitment Therapy (ACT)',
        description: 'Acceptance & Commitment Therapy principles for living a value-driven life and increasing psychological flexibility. Learn to help clients stop fighting their inner experience and move toward meaningful action.',
        curriculum: [
            'ACT theoretical foundations and Relational Frame Theory',
            'The six core ACT processes',
            'Acceptance and willingness techniques',
            'Cognitive defusion strategies',
            'Present moment awareness and mindfulness in ACT',
            'Self-as-context and observer self',
            'Values clarification exercises',
            'Committed action and behavior change'
        ],
        target_audience: 'Therapists, coaches, and counselors seeking a mindfulness-based approach',
        prerequisites: 'No prior therapy training required'
    },
    'personality-disorders-course': {
        name_ar: 'اضطرابات الشخصية',
        name_en: 'Personality Disorders Course',
        description: 'An in-depth understanding of personality disorders and effective therapeutic approaches for mental health professionals. Learn to assess, formulate, and treat the full spectrum of personality disorders.',
        curriculum: [
            'DSM-5 and ICD-11 personality disorder classification',
            'Cluster A, B, and C disorders in depth',
            'Assessment and differential diagnosis',
            'Evidence-based treatment approaches (DBT, Schema Therapy, MBT)',
            'Therapeutic alliance with challenging clients',
            'Managing countertransference',
            'Case formulation for personality disorders',
            'Long-term treatment planning'
        ],
        target_audience: 'Experienced therapists and mental health professionals',
        prerequisites: 'Prior clinical experience with personality disorders recommended'
    },
    'healing-journey-program': {
        name_ar: 'برنامج رحلة تعافي',
        name_en: 'Healing Journey Program',
        description: 'A comprehensive program designed to help you process trauma and build emotional resilience. Combines evidence-based trauma-informed approaches with practical healing strategies.',
        curriculum: [
            'Understanding trauma and its effects on the mind and body',
            'Trauma-informed care principles',
            'Processing traumatic memories safely',
            'Building emotional regulation skills',
            'Developing post-traumatic growth',
            'Self-compassion and inner healing practices',
            'Creating a personal recovery roadmap'
        ],
        target_audience: 'Individuals and professionals interested in trauma recovery and resilience',
        prerequisites: 'No prior training required'
    }
};

const DB_ID_TO_SLUG = {
    1: 'tri-therapy-bundle',
    2: 'cbt-course',
    3: 'dbt-course',
    4: 'personality-disorders-course',
    5: 'act-course',
    6: 'healing-journey-program'
};

async function getCourseBySlug(slug) {
    let dbId = null;
    for (const [id, s] of Object.entries(DB_ID_TO_SLUG)) {
        if (s === slug) dbId = parseInt(id);
    }
    if (!dbId) return null;

    const { data, error } = await supabase.from('courses').select('*').eq('id', dbId).single();
    if (error || !data) {
        console.error(`[API] Failed to fetch course from DB for slug ${slug}:`, error);
        return null;
    }
    
    const staticInfo = COURSE_CATALOG[slug];
    if (!staticInfo) return null;

    return {
        id: dbId,
        slug: slug,
        title: data.title,
        name_ar: staticInfo.name_ar,
        name_en: staticInfo.name_en,
        price: data.price,
        original_price: data.original_price,
        discount_badge: data.discount_badge,
        image_url: data.image_url,
        is_bundle: data.is_bundle,
        duration: data.duration,
        excerpt: data.excerpt,
        currency: 'EGP',
        curriculum: staticInfo.curriculum,
        target_audience: staticInfo.target_audience,
        prerequisites: staticInfo.prerequisites,
        description: staticInfo.description
    };
}

// Helper: extract and verify user JWT from Authorization header
async function getUserFromRequest(req) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return null;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// 1. Signup Endpoint
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body || {};
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const normalizedName = typeof name === 'string' ? name.trim().slice(0, 120) : '';
        
        if (!normalizedEmail || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password: password,
            options: {
                data: {
                    name: normalizedName
                }
            }
        });

        if (error) return res.status(400).json({ error: error.message });

        // Supabase returns an empty identities array if the user already exists.
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            return res.status(400).json({ error: 'This account already exists. Please log in instead.' });
        }



        res.status(201).json({ message: 'Account created successfully!', user: data.user, session: data.session });
    } catch (err) {
        console.error('[API] signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail || typeof password !== 'string' || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: password,
        });

        if (error) return res.status(400).json({ error: error.message });



        res.status(200).json({ message: 'Login successful', session: data.session });
    } catch (err) {
        console.error('[API] login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2.5 Record Login Endpoint (Internal)
app.post('/api/auth/record-login', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const email = user.email || '';
        const full_name = user.user_metadata?.name || user.user_metadata?.full_name || '';
        const phone = user.phone || null;
        
        // Try to identify provider from app_metadata
        let provider = 'unknown';
        if (user.app_metadata && user.app_metadata.provider) {
            provider = user.app_metadata.provider;
        }

        const { error } = await supabase.from('registration').insert({
            user_id: user.id,
            email: email,
            full_name: full_name,
            phone: phone,
            auth_provider: provider
        });

        if (error) {
            console.error('[API] ⚠️ Failed to log registration event:', error.message);
        }

        // Always return success to client so it doesn't break the login flow
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('[API] record-login exception:', err);
        res.status(200).json({ success: true, error: 'Failed safely' });
    }
});

// 3. OAuth Endpoint (Google / Facebook)
app.get('/api/auth/oauth', async (req, res) => {
    try {
        const { provider, redirect_to } = req.query || {};
        const allowedProviders = new Set(['google']);
        if (!allowedProviders.has(provider)) return res.status(400).json({ error: 'Unsupported OAuth provider' });
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: typeof redirect_to === 'string' && redirect_to.startsWith(SITE_URL)
                    ? redirect_to
                    : `${SITE_URL}/`
            }
        });

        if (error) return res.status(400).json({ error: error.message });
        res.json({ url: data.url });
    } catch (err) {
        console.error('[API] oauth error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3.5 Logout Endpoint
app.delete('/api/auth/logout', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('[API] logout error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body || {};
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!normalizedEmail) return res.status(400).json({ error: 'Email is required' });

        const resetUrl = `${SITE_URL}/reset-password.html`;

        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
            redirectTo: resetUrl
        });

        if (error && !error.message.includes('not found')) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'If this email is registered, a password reset link has been sent.' });
    } catch (err) {
        console.error('[API] forgot-password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Used by the verification overlay in the client after sign-up.
app.post('/api/auth/resend-verification', async (req, res) => {
    try {
        const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: { emailRedirectTo: `${SITE_URL}/` }
        });

        // Do not reveal account state to callers.
        if (error) console.error('[API] resend verification error:', error.message);
        res.json({ message: 'If this email is eligible, a verification email has been sent.' });
    } catch (err) {
        console.error('[API] resend verification exception:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 5. Verify OTP (email confirmation)
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, token } = req.body || {};
        if (!email || !token) return res.status(400).json({ error: 'Email and code are required' });

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup'
        });

        if (error) return res.status(400).json({ error: error.message });
        res.json({ session: data.session, user: data.user || data.session?.user });
    } catch (err) {
        console.error('[API] verify-otp error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 6. Update Password (authenticated users)
app.post('/api/auth/update-password', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized — please log in' });

        const { new_password } = req.body;
        if (!new_password || new_password.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters' });
        }

        // Use admin API to update password (service role key required)
        const { error } = await supabase.auth.admin.updateUserById(user.id, {
            password: new_password
        });

        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('[API] update-password exception:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 7. Delete Account (authenticated users)
app.delete('/api/auth/delete-account', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized — please log in' });

        // Delete related purchases first
        await supabase.from('purchases').delete().eq('user_id', user.id);

        // Delete user via admin API
        const { error } = await supabase.auth.admin.deleteUser(user.id);
        if (error) {
            console.error('[API] delete-account error:', error);
            return res.status(500).json({ error: 'Failed to delete account' });
        }

        console.log(`[API] 🗑️ Account deleted: user=${user.id}`);
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('[API] delete-account exception:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 8. Update Profile (name, bio)
app.post('/api/profile/update', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { name, bio } = req.body || {};
        const updateData = {};
        if (name !== undefined) updateData.name = String(name).trim().slice(0, 120);
        if (bio !== undefined) updateData.bio = String(bio).trim().slice(0, 2_000);

        const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: { ...user.user_metadata, ...updateData }
        });

        if (error) return res.status(400).json({ error: error.message });
        res.json({ message: 'Profile updated successfully', user: data.user });
    } catch (err) {
        console.error('[API] profile update exception:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 9. Upload Profile Picture
app.post('/api/profile/picture', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { base64_image } = req.body;
        if (!base64_image) return res.status(400).json({ error: 'No image provided' });

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const image = decodeImageDataUrl(base64_image, allowedTypes, 5 * 1024 * 1024);
        if (!image) return res.status(400).json({ error: 'Invalid image. Use a supported image smaller than 5MB.' });

        const { contentType, buffer } = image;
        const ext = contentType.split('/')[1] || 'jpg';
        const filename = `avatar_${user.id}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('avatars')
            .upload(filename, buffer, { contentType, upsert: true });

        if (uploadError) {
            console.error('[API] Avatar upload error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload image' });
        }

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filename);
        const avatarUrl = urlData.publicUrl;

        // Save avatar URL to user metadata
        await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: { ...user.user_metadata, avatar_url: avatarUrl }
        });

        res.json({ message: 'Profile picture updated', avatar_url: avatarUrl });
    } catch (err) {
        console.error('[API] profile picture exception:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// DATABASE ENDPOINTS
// ==========================================

// Get all posts from Supabase
app.get('/api/posts', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('order_index', { ascending: true, nullsFirst: false })
            .order('id', { ascending: false });

        if (error) {
            console.error("Error fetching posts from DB:", error);
            return res.json([
                { id: 1, title: 'Understanding CBT', excerpt: 'A brief introduction to Cognitive Behavioral Therapy.', date: '2026-05-01' },
                { id: 2, title: 'Emotional Regulation Techniques', excerpt: 'How to manage overwhelming emotions.', date: '2026-05-15' }
            ]);
        }

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

async function getAllCourses() {
    const { data, error } = await supabase.from('courses')
        .select('*')
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('id', { ascending: true });

    if (error || !data) {
        console.error('[API] Failed to fetch all courses from DB:', error);
        return [];
    }

    const merged = [];
    for (const dbCourse of data) {
        const slug = DB_ID_TO_SLUG[dbCourse.id];
        if (!slug) continue;
        
        const staticInfo = COURSE_CATALOG[slug];
        if (!staticInfo) continue;

        merged.push({
            id: dbCourse.id,
            slug: slug,
            title: dbCourse.title,
            name_ar: staticInfo.name_ar,
            name_en: staticInfo.name_en,
            price: dbCourse.price,
            original_price: dbCourse.original_price,
            discount_badge: dbCourse.discount_badge,
            image_url: dbCourse.image_url,
            is_bundle: dbCourse.is_bundle,
            duration: dbCourse.duration,
            excerpt: dbCourse.excerpt,
            currency: 'EGP',
            curriculum: staticInfo.curriculum,
            target_audience: staticInfo.target_audience,
            prerequisites: staticInfo.prerequisites,
            description: staticInfo.description
        });
    }
    return merged;
}

// Get all courses — returns authoritative catalog
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await getAllCourses();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get single course by slug (for course detail page)
app.get('/api/courses/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const course = await getCourseBySlug(slug);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
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
                { id: 1, rating: 5, quote: "The CBT training provided me with invaluable clinical tools. Dr. Marwa's approach is both scientific and deeply practical.", author: "Sarah M., Clinical Psychologist" },
                { id: 2, rating: 5, quote: "I took the Tri-Therapy Bundle — the best investment I've made for my career. The integration of CBT, DBT, and ACT has transformed how I work with clients.", author: "Ahmed K., Psychotherapist" },
                { id: 3, rating: 5, quote: "Dr. Marwa has a remarkable ability to explain complex psychological concepts in an accessible, applicable way. The DBT course changed my practice.", author: "Laila T., Counseling Psychologist" },
                { id: 4, rating: 5, quote: "The Personality Disorders course gave me the confidence to work with the most challenging clinical presentations. Highly recommend to any serious clinician.", author: "Omar R., Mental Health Counselor" },
                { id: 5, rating: 5, quote: "سيتم إضافة المزيد من آراء وتقييمات المتدربين لبرامجنا التدريبية هنا قريبًا.", author: "متدرب - قريباً" }
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
// PAYMENT & ACCESS ENDPOINTS
// ==========================================

// POST /api/record-purchase
app.post('/api/record-purchase', async (req, res) => {
    // Transaction IDs and callback URLs are browser-controlled. Access activation
    // must happen only after a verified provider webhook, which is not in this repo.
    return res.status(503).json({
        error: 'Automatic enrollment is unavailable until verified payment-webhook processing is configured.'
    });
});

// POST /api/kashier-hash
app.post('/api/kashier-hash', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized - please log in' });

        const { course_id } = req.body || {};
        if (!course_id) return res.status(400).json({ error: 'Missing course_id' });

        const courseInfo = await getCourseBySlug(course_id);
        if (!courseInfo) return res.status(400).json({ error: 'Invalid course ID' });

        const amount = courseInfo.price;
        const currency = courseInfo.currency || 'EGP';
        const mode = process.env.KASHIER_MODE || 'test';
        const merchantId = process.env.KASHIER_MERCHANT_ID || (mode === 'test' ? 'MID-1234-TEST' : '');
        const secret = process.env.KASHIER_API_KEY || (mode === 'test' ? 'TEST_SECRET_KEY' : '');
        if (!merchantId || !secret) {
            return res.status(503).json({ error: 'Payment gateway is not configured.' });
        }
        const crypto = require('crypto');
        const orderId = `order_${Date.now()}_${crypto.randomUUID()}`;

        // Kashier Hash Generation (Node.js)
        const path = `/?payment=${merchantId}.${orderId}.${amount}.${currency}`;
        const hash = crypto.createHmac('sha256', secret).update(path).digest('hex');

        res.json({
            hash: hash,
            orderId: orderId,
            merchantId: merchantId,
            amount: amount,
            currency: currency,
            mode // test or live
        });
    } catch (err) {
        console.error('[API] kashier-hash exception:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/instapay-request
app.post('/api/instapay-request', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized - please log in' });

        const { course_id, username, whatsapp, base64_receipt } = req.body || {};
        if (!course_id) return res.status(400).json({ error: 'Missing course_id' });

        const courseInfo = await getCourseBySlug(course_id);
        if (!courseInfo) return res.status(400).json({ error: 'Invalid course ID' });

        const secureAmountPaid = courseInfo.price;
        const secureCurrency = courseInfo.currency || 'EGP';

        // Check if already enrolled (active)
        const { data: existingActive } = await supabase
            .from('purchases')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', course_id)
            .eq('is_active', true)
            .single();

        if (existingActive) {
            return res.status(200).json({ message: 'Already enrolled in this course', already_enrolled: true });
        }

        // Receipts are required for manual approval and must remain bounded.
        const receipt = decodeImageDataUrl(base64_receipt, ['image/jpeg', 'image/png', 'image/webp'], 5 * 1024 * 1024);
        if (!receipt) return res.status(400).json({ error: 'A JPEG, PNG, or WebP receipt smaller than 5MB is required.' });

        const { contentType, buffer } = receipt;
        const crypto = require('crypto');
        const filename = `receipt_${Date.now()}_${crypto.randomUUID()}.${contentType.split('/')[1] || 'jpg'}`;
        const { error: uploadError } = await supabase
            .storage
            .from('receipts')
            .upload(filename, buffer, { contentType, upsert: false });

        if (uploadError) {
            console.error('[API] Failed to upload receipt:', uploadError);
            return res.status(500).json({ error: 'Failed to upload receipt' });
        }
        const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(filename);
        const receiptUrl = urlData.publicUrl;
        
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
                is_active: false, // Instapay requires manual activation
                customer_name: typeof username === 'string' ? username.trim().slice(0, 120) : '',
                customer_whatsapp: typeof whatsapp === 'string' ? whatsapp.trim().slice(0, 40) : ''
            }]);

        if (error) {
            console.error('[API] instapay-request DB error:', error);
            return res.status(500).json({ error: 'Failed to record request' });
        }

        console.log(`[API] 🟡 Pending InstaPay request: user=${user.id} course=${course_id} txn=${transaction_id}`);
        res.status(201).json({ 
            message: 'Request recorded successfully. Pending admin approval.', 
            data, 
            receipt_url: receiptUrl 
        });

    } catch (err) {
        console.error('[API] instapay-request exception:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/check-access?course_id=cbt-course
app.get('/api/check-access', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(200).json({ has_access: false, reason: 'not_logged_in' });
        }

        const { course_id } = req.query;
        if (!course_id) {
            return res.status(400).json({ error: 'Missing course_id query parameter' });
        }

        const { data, error } = await supabase
            .from('purchases')
            .select('id, is_active')
            .eq('user_id', user.id)
            .eq('course_id', course_id);

        if (error || !data || data.length === 0) {
            return res.status(200).json({ has_access: false, pending: false, reason: 'not_purchased' });
        }

        const isActive = data.some(p => p.is_active === true);
        const isPending = data.some(p => p.is_active === false);

        res.status(200).json({ has_access: isActive, pending: isPending });

    } catch (err) {
        console.error('[API] check-access exception:', err);
        res.status(500).json({ has_access: false, error: 'Internal server error' });
    }
});

// GET /api/enrollment-status — alias for /api/check-access (used by course-detail page)
// Returns { enrolled: bool, pending: bool }
app.get('/api/enrollment-status', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(200).json({ enrolled: false, pending: false });

        const { course_id } = req.query;
        if (!course_id) return res.status(400).json({ error: 'Missing course_id' });

        const { data, error } = await supabase
            .from('purchases')
            .select('id, is_active')
            .eq('user_id', user.id)
            .eq('course_id', course_id);

        if (error || !data || data.length === 0) {
            return res.status(200).json({ enrolled: false, pending: false });
        }

        const isActive = data.some(p => p.is_active === true);
        const isPending = data.some(p => p.is_active === false);
        res.status(200).json({ enrolled: isActive, pending: isPending && !isActive });
    } catch (err) {
        res.status(500).json({ enrolled: false, error: 'Internal server error' });
    }
});

// GET /api/my-courses — returns all purchases for authenticated user
app.get('/api/my-courses', async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { data, error } = await supabase
            .from('purchases')
            .select('course_id, purchased_at, amount_paid, currency, transaction_id, is_active')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('purchased_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        // Enrich with authoritative course data from DB
        const enriched = [];
        for (const purchase of (data || [])) {
            const courseInfo = await getCourseBySlug(purchase.course_id);
            if (courseInfo) {
                enriched.push({
                    ...purchase,
                    course_name_ar: courseInfo.name_ar,
                    course_name_en: courseInfo.name_en,
                    course_duration: courseInfo.duration || '—',
                    course_description: courseInfo.description || '',
                    course_image: courseInfo.image_url || '',
                    currency: purchase.currency || 'EGP'
                });
            } else {
                // Fallback if course not found in DB
                enriched.push({
                    ...purchase,
                    course_name_ar: purchase.course_id,
                    course_name_en: purchase.course_id,
                    course_duration: '—',
                    course_description: '',
                    course_image: '',
                    currency: purchase.currency || 'EGP'
                });
            }
        }

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Fallback route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
