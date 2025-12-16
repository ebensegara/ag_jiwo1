-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR JIWO.AI
-- Mental Health & Wellness Platform
-- =====================================================

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  company_id UUID,
  department TEXT,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- =====================================================
-- 2. COMPANIES TABLE (Corporate Wellness)
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  industry TEXT,
  employee_count INTEGER,
  subscription_plan TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_admin_email ON companies(admin_email);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_status ON companies(subscription_status);

-- Add foreign key to users table
ALTER TABLE users 
ADD CONSTRAINT users_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- =====================================================
-- 3. COMPANY ADMINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS company_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_admins_company_id ON company_admins(company_id);
CREATE INDEX IF NOT EXISTS idx_company_admins_user_id ON company_admins(user_id);

-- =====================================================
-- 4. COMPANY EMPLOYEES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS company_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id TEXT,
  department TEXT,
  position TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_employees_company_id ON company_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_user_id ON company_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_department ON company_employees(department);

-- =====================================================
-- 5. MOODS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood_value INTEGER NOT NULL CHECK (mood_value >= 1 AND mood_value <= 5),
  mood_label TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);
CREATE INDEX IF NOT EXISTS idx_moods_created_at ON moods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moods_user_created ON moods(user_id, created_at DESC);

-- =====================================================
-- 6. JOURNALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood_id UUID REFERENCES moods(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_created_at ON journals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journals_mood_id ON journals(mood_id);
CREATE INDEX IF NOT EXISTS idx_journals_tags ON journals USING GIN(tags);

-- =====================================================
-- 7. SCREENINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  screening_type TEXT NOT NULL,
  score INTEGER,
  severity_level TEXT,
  responses JSONB,
  result_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screenings_user_id ON screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_screenings_type ON screenings(screening_type);
CREATE INDEX IF NOT EXISTS idx_screenings_created_at ON screenings(created_at DESC);

-- =====================================================
-- 8. PROFESSIONALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  category TEXT NOT NULL,
  specialization TEXT NOT NULL,
  bio TEXT,
  experience_years INTEGER,
  rating DECIMAL(3,2) DEFAULT 5.0,
  price_per_session INTEGER NOT NULL,
  avatar_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_professionals_category ON professionals(category);
CREATE INDEX IF NOT EXISTS idx_professionals_is_available ON professionals(is_available);
CREATE INDEX IF NOT EXISTS idx_professionals_rating ON professionals(rating DESC);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);

-- =====================================================
-- 9. BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  session_time TIMESTAMPTZ NOT NULL,
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON bookings(professional_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session_time ON bookings(session_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- =====================================================
-- 10. CHAT CHANNELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, professional_id, booking_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_channels_user_id ON chat_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_channels_professional_id ON chat_channels(professional_id);
CREATE INDEX IF NOT EXISTS idx_chat_channels_booking_id ON chat_channels(booking_id);

-- =====================================================
-- 11. CARE CHAT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS care_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_care_chat_messages_channel_id ON care_chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_care_chat_messages_sender_id ON care_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_care_chat_messages_created_at ON care_chat_messages(created_at DESC);

-- =====================================================
-- 12. CHAT MESSAGES TABLE (AI Chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- =====================================================
-- 13. CHAT USAGE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  chat_count INTEGER DEFAULT 0,
  chat_limit INTEGER DEFAULT 10,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_usage_user_id ON chat_usage(user_id);

-- =====================================================
-- 14. PLANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_name ON plans(name);

-- =====================================================
-- 15. SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- 16. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  qris_link TEXT,
  ref_code TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_ref_code ON payments(ref_code);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- =====================================================
-- 17. REWARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_created_at ON rewards(created_at DESC);

-- =====================================================
-- 18. INSIGHTS TABLE (Weekly Insights)
-- =====================================================
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  mood_average DECIMAL(3,2),
  mood_trend DECIMAL(3,2),
  activity_average DECIMAL(3,2),
  activity_trend DECIMAL(3,2),
  journal_insights TEXT,
  screening_results TEXT,
  key_observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_week_start ON insights(week_start DESC);

-- =====================================================
-- 19. COMPANY INSIGHTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS company_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_employees INTEGER,
  active_users INTEGER,
  avg_mood_score DECIMAL(3,2),
  mood_trend TEXT,
  stress_level TEXT,
  engagement_rate DECIMAL(5,2),
  session_count INTEGER,
  journal_count INTEGER,
  department_insights JSONB,
  ai_insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_company_insights_company_id ON company_insights(company_id);
CREATE INDEX IF NOT EXISTS idx_company_insights_week_start ON company_insights(week_start DESC);

-- =====================================================
-- 20. COMPANY ALERTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS company_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_alerts_company_id ON company_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_company_alerts_is_read ON company_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_company_alerts_created_at ON company_alerts(created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to increment chat count
CREATE OR REPLACE FUNCTION increment_chat_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO chat_usage (user_id, chat_count, updated_at)
  VALUES (p_user_id, 1, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    chat_count = chat_usage.chat_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for companies table
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for journals table
DROP TRIGGER IF EXISTS update_journals_updated_at ON journals;
CREATE TRIGGER update_journals_updated_at
  BEFORE UPDATE ON journals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for professionals table
DROP TRIGGER IF EXISTS update_professionals_updated_at ON professionals;
CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bookings table
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chat_channels table
DROP TRIGGER IF EXISTS update_chat_channels_updated_at ON chat_channels;
CREATE TRIGGER update_chat_channels_updated_at
  BEFORE UPDATE ON chat_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chat_usage table
DROP TRIGGER IF EXISTS update_chat_usage_updated_at ON chat_usage;
CREATE TRIGGER update_chat_usage_updated_at
  BEFORE UPDATE ON chat_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for subscriptions table
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payments table
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

alter publication supabase_realtime add table users;
alter publication supabase_realtime add table moods;
alter publication supabase_realtime add table journals;
alter publication supabase_realtime add table screenings;
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table chat_channels;
alter publication supabase_realtime add table care_chat_messages;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table chat_usage;
alter publication supabase_realtime add table payments;
alter publication supabase_realtime add table company_insights;
alter publication supabase_realtime add table company_alerts;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Main users table with role-based access (user, professional, corporate_admin, admin)';
COMMENT ON TABLE companies IS 'Corporate wellness companies';
COMMENT ON TABLE moods IS 'Daily mood check-ins from users';
COMMENT ON TABLE journals IS 'User journal entries with mood tracking';
COMMENT ON TABLE screenings IS 'Mental health and personality test results';
COMMENT ON TABLE professionals IS 'Mental health professionals (psychologists, life coaches, etc.)';
COMMENT ON TABLE bookings IS 'Session bookings between users and professionals';
COMMENT ON TABLE chat_channels IS 'Chat channels for professional care conversations';
COMMENT ON TABLE care_chat_messages IS 'Messages in professional care chat channels';
COMMENT ON TABLE chat_messages IS 'AI chatbot conversation messages';
COMMENT ON TABLE chat_usage IS 'Track AI chat usage limits per user';
COMMENT ON TABLE payments IS 'Payment transactions for bookings and subscriptions';
COMMENT ON TABLE company_insights IS 'Weekly analytics for corporate wellness programs';
COMMENT ON TABLE company_alerts IS 'Alerts for corporate admins about employee wellbeing';
