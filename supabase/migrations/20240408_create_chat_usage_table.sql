CREATE TABLE IF NOT EXISTS public.chat_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chat_count INTEGER DEFAULT 0,
  chat_limit INTEGER DEFAULT 10,
  is_premium BOOLEAN DEFAULT false,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_chat_usage_user_id ON public.chat_usage(user_id);

DROP POLICY IF EXISTS "Users can view own chat usage" ON public.chat_usage;
CREATE POLICY "Users can view own chat usage"
ON public.chat_usage FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chat usage" ON public.chat_usage;
CREATE POLICY "Users can update own chat usage"
ON public.chat_usage FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat usage" ON public.chat_usage;
CREATE POLICY "Users can insert own chat usage"
ON public.chat_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

alter publication supabase_realtime add table chat_usage;
