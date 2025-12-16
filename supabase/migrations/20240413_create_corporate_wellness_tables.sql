CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  employee_count INTEGER,
  admin_email TEXT NOT NULL,
  subscription_plan TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.company_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  department TEXT,
  position TEXT,
  employee_id TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.company_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_employees INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  avg_mood_score NUMERIC,
  mood_trend TEXT,
  stress_level TEXT,
  engagement_rate NUMERIC,
  journal_count INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  ai_insights JSONB,
  department_insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS position TEXT;

CREATE INDEX IF NOT EXISTS idx_company_employees_company_id ON public.company_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_user_id ON public.company_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_company_insights_company_id ON public.company_insights(company_id);
CREATE INDEX IF NOT EXISTS idx_company_insights_week ON public.company_insights(week_start, week_end);
CREATE INDEX IF NOT EXISTS idx_company_alerts_company_id ON public.company_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.company_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_insights;
