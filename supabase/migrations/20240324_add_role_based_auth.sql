ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE public.professionals DROP COLUMN IF EXISTS name;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.professionals DROP COLUMN IF EXISTS specialty;

CREATE UNIQUE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals(user_id);

DROP POLICY IF EXISTS "Professionals can update own profile" ON public.professionals;
CREATE POLICY "Professionals can update own profile"
ON public.professionals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Professionals can insert own profile" ON public.professionals;
CREATE POLICY "Professionals can insert own profile"
ON public.professionals FOR INSERT
WITH CHECK (auth.uid() = user_id);

alter publication supabase_realtime add table professionals;
