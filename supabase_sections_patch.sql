-- Supabase Sections Patch
-- This creates the sections table to allow full editability of the website from the admin dashboard

CREATE TABLE IF NOT EXISTS public.sections (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    subtitle TEXT,
    content TEXT,
    image_url TEXT,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default rows if they don't exist
INSERT INTO public.sections (section_key, title, subtitle, content)
VALUES
    ('hero', 'Dr. Marwa Badr Ahmed', 'Consultant & Trainer for Mental Health Professionals', 'Empowering psychologists and mental health professionals with advanced evidence-based practices (CBT, DBT, ACT) to elevate their clinical skills and therapeutic impact.'),
    ('about', 'About Me', '', '<p>I am a Mental Health Specialist and Trainer dedicated to elevating the standards of psychological practice. With extensive experience in clinical supervision and professional training, my mission is to equip psychologists with practical, evidence-based tools.</p><p>I specialize in training professionals in <strong>Cognitive Behavioral Therapy (CBT)</strong>, <strong>Dialectical Behavior Therapy (DBT)</strong>, and <strong>Acceptance & Commitment Therapy (ACT)</strong>. My programs focus on case formulation, advanced therapeutic techniques, and managing complex clinical cases.</p><p>Whether you are a newly graduated psychologist or an experienced practitioner, my courses and supervision sessions are designed to build your clinical confidence and enhance your therapeutic effectiveness.</p>'),
    ('expertise', 'My Expertise', '', ''),
    ('courses', 'Professional Training Courses', 'Advanced training programs designed specifically for mental health professionals.', ''),
    ('contact', 'Get In Touch', 'Have an inquiry regarding training or clinical supervision? Reach out below.', '')
ON CONFLICT (section_key) DO NOTHING;

-- Set up Row Level Security
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to sections" ON public.sections;
CREATE POLICY "Allow public read access to sections"
ON public.sections FOR SELECT
USING (true);

-- Allow all operations for simplicity in this backend pattern, though typically you'd restrict this
DROP POLICY IF EXISTS "Allow all operations on sections" ON public.sections;
CREATE POLICY "Allow all operations on sections"
ON public.sections FOR ALL
USING (true)
WITH CHECK (true);
