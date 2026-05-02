-- =====================================================
-- P0 v1.2: Companion Features Migration
-- Note: Using public.users (not profiles — doesn't exist)
-- =====================================================

-- 1.1 Add agent_preferences to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS agent_preferences jsonb DEFAULT '{
  "tone": "bestie",
  "preferred_name": null,
  "quiet_hours": ["22:00", "07:00"]
}'::jsonb;

-- 1.2 Add source column to agent_memory
ALTER TABLE public.agent_memory
ADD COLUMN IF NOT EXISTS source text DEFAULT 'chat';

-- 1.3 Create panic_logs table (needed by panic route)
CREATE TABLE IF NOT EXISTS public.panic_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger TEXT DEFAULT 'pending_user_input',
  hr_before INTEGER,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  techniques_used TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_panic_logs_user_id ON public.panic_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_panic_logs_created_at ON public.panic_logs(created_at DESC);

ALTER TABLE public.panic_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own panic logs" ON public.panic_logs;
CREATE POLICY "Users can manage own panic logs"
  ON public.panic_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 1.4 Create rituals table
CREATE TABLE IF NOT EXISTS public.rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'morning_pulse' | 'night_dump' | 'check_in'
  scheduled_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rituals_user_id ON public.rituals(user_id);
CREATE INDEX IF NOT EXISTS idx_rituals_type ON public.rituals(type);

ALTER TABLE public.rituals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User manage own rituals" ON public.rituals;
CREATE POLICY "User manage own rituals" ON public.rituals
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 1.5 Create ritual_logs table
CREATE TABLE IF NOT EXISTS public.ritual_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_id UUID REFERENCES public.rituals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ritual_logs_user_id ON public.ritual_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ritual_logs_completed_at ON public.ritual_logs(completed_at DESC);

ALTER TABLE public.ritual_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User manage own ritual_logs" ON public.ritual_logs;
CREATE POLICY "User manage own ritual_logs" ON public.ritual_logs
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 1.6 Service role policies for server-side API calls
CREATE POLICY "Service role bypass panic_logs"
  ON public.panic_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass rituals"
  ON public.rituals FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass ritual_logs"
  ON public.ritual_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
