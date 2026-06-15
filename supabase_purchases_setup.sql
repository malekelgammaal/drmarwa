-- ============================================================
--  Purchases Table — Dr. Marwa Badr Platform
--  Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id       TEXT NOT NULL,
    amount_paid     NUMERIC(10,2) NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'USD',
    transaction_id  TEXT UNIQUE NOT NULL,
    purchased_at    TIMESTAMPTZ DEFAULT NOW(),
    is_active       BOOLEAN DEFAULT TRUE
);

-- 2. Index for fast lookup (user wants to open their course)
CREATE INDEX IF NOT EXISTS idx_purchases_user_course
    ON public.purchases(user_id, course_id);

-- ============================================================
--  Row Level Security (RLS) — THE SECURITY LAYER
--  A user can ONLY see their OWN purchases. Nobody else's.
-- ============================================================

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can read only their own purchases
CREATE POLICY "Users can view own purchases"
    ON public.purchases
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only the server (service_role) can insert purchases
-- This prevents frontend manipulation of purchase records
CREATE POLICY "Service role can insert purchases"
    ON public.purchases
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Nobody can update or delete purchases (immutable records)
-- (No UPDATE or DELETE policies = blocked for everyone)

-- ============================================================
--  Helper function: check if user owns a course
--  Usage: SELECT public.user_owns_course('cbt-course');
-- ============================================================
CREATE OR REPLACE FUNCTION public.user_owns_course(p_course_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.purchases
        WHERE user_id = auth.uid()
          AND course_id = p_course_id
          AND is_active = TRUE
    );
$$;
