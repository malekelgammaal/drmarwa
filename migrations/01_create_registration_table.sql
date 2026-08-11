-- Create registration table for logging successful logins
CREATE TABLE IF NOT EXISTS public.registration (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    full_name text,
    phone text,
    auth_provider text,
    login_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Add index on user_id and login_at for efficient querying
CREATE INDEX IF NOT EXISTS registration_user_id_idx ON public.registration (user_id);
CREATE INDEX IF NOT EXISTS registration_login_at_idx ON public.registration (login_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.registration ENABLE ROW LEVEL SECURITY;

-- Note: No public policies are added.
-- By default, this means normal users cannot SELECT, INSERT, UPDATE, or DELETE any records.
-- The backend service will insert records using the service_role key, which bypasses RLS.
-- This ensures the audit log is completely secure and write-only from the application's perspective.
