-- ============================================================
--  ADD order_index COLUMN TO ALL TABLES
--  Run this in Supabase Dashboard → SQL Editor
--  This fixes the Reorder buttons in the Admin panel.
-- ============================================================

-- 1. Add order_index to courses (if not exists)
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 2. Add order_index to posts (if not exists)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 3. Add order_index to testimonials (if not exists)
ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 4. Set initial order values based on current id order
UPDATE public.courses c
SET order_index = sub.row_num
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id ASC) - 1 AS row_num
    FROM public.courses
) sub
WHERE c.id = sub.id;

UPDATE public.posts p
SET order_index = sub.row_num
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id ASC) - 1 AS row_num
    FROM public.posts
) sub
WHERE p.id = sub.id;

UPDATE public.testimonials t
SET order_index = sub.row_num
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id ASC) - 1 AS row_num
    FROM public.testimonials
) sub
WHERE t.id = sub.id;

-- ============================================================
--  Verify — run each separately if preferred
-- ============================================================
SELECT 'courses' AS tbl, id::text, order_index FROM public.courses
UNION ALL
SELECT 'posts', id::text, order_index FROM public.posts
UNION ALL
SELECT 'testimonials', id::text, order_index FROM public.testimonials
ORDER BY tbl, order_index;
