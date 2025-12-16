ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'professional'));

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
