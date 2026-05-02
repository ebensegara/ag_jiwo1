-- =====================================================
-- CREATE PANIC_LOGS TABLE
-- Tracks panic button events with context
-- =====================================================

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

-- RLS
ALTER TABLE public.panic_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own panic logs"
  ON public.panic_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own panic logs"
  ON public.panic_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own panic logs"
  ON public.panic_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role bypass (needed for server-side API calls)
CREATE POLICY "Service role can do all on panic_logs"
  ON public.panic_logs FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.panic_logs IS 'Tracks panic button presses with trigger context and resolution status';
