CREATE TABLE IF NOT EXISTS public.moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mood_value DECIMAL(3,1) NOT NULL CHECK (mood_value >= 1 AND mood_value <= 5),
  mood_label TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood_id UUID REFERENCES public.moods(id) ON DELETE SET NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  average_mood DECIMAL(3,1),
  mood_trend TEXT,
  journal_count INTEGER DEFAULT 0,
  top_emotions TEXT[],
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  screening_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  severity_level TEXT,
  responses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  credentials TEXT,
  bio TEXT,
  rating DECIMAL(2,1),
  availability TEXT[],
  price_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  screening_id UUID REFERENCES public.screenings(id) ON DELETE SET NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own moods" ON public.moods;
CREATE POLICY "Users can manage own moods"
ON public.moods FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own journals" ON public.journals;
CREATE POLICY "Users can manage own journals"
ON public.journals FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own insights" ON public.insights;
CREATE POLICY "Users can view own insights"
ON public.insights FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own rewards" ON public.rewards;
CREATE POLICY "Users can view own rewards"
ON public.rewards FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own screenings" ON public.screenings;
CREATE POLICY "Users can manage own screenings"
ON public.screenings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all professionals" ON public.professionals;
CREATE POLICY "Users can view all professionals"
ON public.professionals FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can manage own bookings" ON public.bookings;
CREATE POLICY "Users can manage own bookings"
ON public.bookings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own chat messages" ON public.chat_messages;
CREATE POLICY "Users can manage own chat messages"
ON public.chat_messages FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

alter publication supabase_realtime add table moods;
alter publication supabase_realtime add table journals;
alter publication supabase_realtime add table insights;
alter publication supabase_realtime add table rewards;
alter publication supabase_realtime add table screenings;
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table chat_messages;

CREATE INDEX idx_moods_user_id ON public.moods(user_id);
CREATE INDEX idx_moods_created_at ON public.moods(created_at DESC);
CREATE INDEX idx_journals_user_id ON public.journals(user_id);
CREATE INDEX idx_journals_created_at ON public.journals(created_at DESC);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
