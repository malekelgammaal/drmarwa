-- ==========================================
-- 0. Clean up old tables to avoid schema conflicts
-- ==========================================
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;

-- ==========================================
-- 1. Create Posts Table
-- ==========================================
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. Create Courses Table
-- ==========================================
CREATE TABLE public.courses (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    discount_badge TEXT,
    image_url TEXT,
    is_bundle BOOLEAN DEFAULT false,
    duration TEXT,
    excerpt TEXT
);

-- ==========================================
-- 3. Create Testimonials Table
-- ==========================================
CREATE TABLE public.testimonials (
    id SERIAL PRIMARY KEY,
    author TEXT NOT NULL,
    quote TEXT NOT NULL,
    rating INTEGER DEFAULT 5
);

-- ==========================================
-- 4. Insert Default Courses Data
-- ==========================================
INSERT INTO public.courses (id, title, price, original_price, discount_badge, image_url, is_bundle, duration, excerpt)
VALUES 
(1, 'Tri-Therapy Bundle <br><small class="arabic-text medium">(باقة العلاج الثلاثي)</small>', 299.99, 400.00, 'Save 25%', 'images/course-tri-therapy.png', true, '15 Days', 'Complete mastery of evidence-based therapies. Includes full access to DBT, CBT, and ACT courses.'),
(2, 'CBT Course <br><small class="arabic-text medium">(العلاج المعرفي السلوكي)</small>', 119.99, 200.00, 'Save 40%', 'images/course-cbt.png', false, '5 Days', 'Learn Cognitive Behavioral Therapy techniques to reframe negative thought patterns.'),
(3, 'DBT Course <br><small class="arabic-text medium">(العلاج الجدلي السلوكي)</small>', 149.99, 250.00, 'Save 40%', 'images/course-dbt.png', false, '5 Days', 'Master Dialectical Behavior Therapy skills for mindfulness and emotional regulation.'),
(4, 'Personality Disorders Course <br><small class="arabic-text medium">(اضطرابات الشخصية)</small>', 149.99, 220.00, 'Save 32%', 'images/course-personality-disorders.png', false, '5 Days', 'An in-depth understanding of personality disorders and effective coping mechanisms.'),
(5, 'ACT Course <br><small class="arabic-text medium">(العلاج بالقبول والالتزام)</small>', 129.99, 200.00, 'Save 35%', 'images/course-act.png', false, '5 Days', 'Acceptance & Commitment Therapy principles for living a value-driven life.'),
(6, 'Healing Journey Program <br><small class="arabic-text medium">(رحلة تعافي)</small>', 74.99, 150.00, 'Save 50%', 'images/course-healing-journey.png', false, '2 Days', 'A comprehensive program designed to help you process trauma and build emotional resilience.');

-- ==========================================
-- 5. Insert Default Blog Posts
-- ==========================================
INSERT INTO public.posts (title, excerpt, content)
VALUES 
('كيف تتعامل مع نوبات القلق؟', 'القلق هو استجابة طبيعية للتوتر، ولكن عندما يتحول إلى نوبات هلع مفاجئة، يمكن أن يكون معيقاً...', 'المحتوى الكامل هنا'),
('قوة التقبل (ACT)', 'نحن غالباً ما نهرب من المشاعر السلبية أو نحاول قمعها، وهذا ما يزيد من المعاناة...', 'المحتوى الكامل هنا');

-- ==========================================
-- 6. Insert Default Testimonials
-- ==========================================
INSERT INTO public.testimonials (author, quote, rating)
VALUES
('Sarah M.', 'The CBT course completely changed how I handle my anxiety. The material is so well-structured and easy to understand.', 5),
('Ahmed K.', 'I took the Tri-Therapy bundle. It''s the best investment I''ve made in my mental health. Highly recommended!', 5),
('Laila T.', 'Dr. Marwa has a way of explaining complex psychological concepts simply. The Healing Journey course was an eye-opener.', 5);

-- ==========================================
-- 7. Security Policies (Allow access to frontend and backend)
-- ==========================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow public read access on courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public read access on testimonials" ON public.testimonials FOR SELECT USING (true);

-- Allow backend (Anon key) to insert/delete
CREATE POLICY "Allow all on posts" ON public.posts FOR ALL USING (true);
CREATE POLICY "Allow all on courses" ON public.courses FOR ALL USING (true);
CREATE POLICY "Allow all on testimonials" ON public.testimonials FOR ALL USING (true);
