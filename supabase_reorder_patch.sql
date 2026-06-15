-- ==========================================
-- SQL Patch to add 'order_index' for Reordering
-- ==========================================

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Optional: If you want to reset order_index based on current ID order initially:
-- UPDATE public.courses SET order_index = id;
-- UPDATE public.posts SET order_index = id;
-- UPDATE public.testimonials SET order_index = id;
