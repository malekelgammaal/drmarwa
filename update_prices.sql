-- ============================================================
--  UPSERT ALL 6 COURSES — Dr. Marwa Badr Platform
--  Run this in Supabase Dashboard → SQL Editor
--  This will INSERT missing courses AND UPDATE existing ones.
--  Updated: 2026-05-03
-- ============================================================

INSERT INTO public.courses (id, title, price, original_price, discount_badge, image_url, is_bundle, duration, excerpt)
VALUES
    (1,  'Tri-Therapy Bundle <br><small class="arabic-text medium">(باقة العلاج الثلاثي)</small>',       349.99, 425.00, 'Save 18%', 'images/course-tri-therapy.png',               true,  '15 Days', 'Complete mastery of evidence-based therapies for mental health professionals. Includes full access to DBT, CBT, and ACT clinical training.'),
    (2,  'CBT Course <br><small class="arabic-text medium">(العلاج المعرفي السلوكي)</small>',             149.99, 200.00, 'Save 25%', 'images/course-cbt.png',                       false, '5 Days',  'Learn Cognitive Behavioral Therapy techniques to reframe negative thought patterns and overcome anxiety and depression.'),
    (3,  'DBT Course <br><small class="arabic-text medium">(العلاج الجدلي السلوكي)</small>',              174.99, 225.00, 'Save 22%', 'images/course-dbt.png',                       false, '5 Days',  'Master Dialectical Behavior Therapy skills for mindfulness, emotional regulation, and distress tolerance.'),
    (4,  'Personality Disorders Course <br><small class="arabic-text medium">(اضطرابات الشخصية)</small>', 174.99, 225.00, 'Save 22%', 'images/course-personality-disorders.png',     false, '5 Days',  'An in-depth understanding of personality disorders and effective coping mechanisms for mental health professionals.'),
    (5,  'ACT Course <br><small class="arabic-text medium">(العلاج بالقبول والالتزام)</small>',           149.99, 200.00, 'Save 25%', 'images/course-act.png',                       false, '5 Days',  'Acceptance & Commitment Therapy principles for living a value-driven life and increasing psychological flexibility.'),
    (6,  'Healing Journey Program <br><small class="arabic-text medium">(رحلة تعافي)</small>',            99.99,  150.00, 'Save 33%', 'images/course-healing-journey.png',           false, '2 Days',  'A comprehensive program designed to help you process trauma and build emotional resilience.')

ON CONFLICT (id) DO UPDATE SET
    title          = EXCLUDED.title,
    price          = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_badge = EXCLUDED.discount_badge,
    image_url      = EXCLUDED.image_url,
    is_bundle      = EXCLUDED.is_bundle,
    duration       = EXCLUDED.duration,
    excerpt        = EXCLUDED.excerpt;

-- ============================================================
--  Verify — should return all 6 courses with new prices
-- ============================================================
SELECT id, price, original_price, discount_badge, is_bundle
FROM public.courses
ORDER BY id;
