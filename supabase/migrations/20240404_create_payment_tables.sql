CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  payment_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  qris_link TEXT,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'booking')),
  ref_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_ref TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref_code ON payments(ref_code);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

INSERT INTO plans (name, description, price, duration_days, features) VALUES
('Basic', 'Perfect for getting started', 49000, 30, '["50 AI chat messages/month", "Access to journal", "Mood tracking", "Basic insights"]'),
('Premium', 'Unlimited access to all features', 99000, 30, '["Unlimited AI chat", "Priority support", "Advanced insights", "All journal features", "Weekly reports"]'),
('Pro', 'For serious mental wellness journey', 149000, 30, '["Everything in Premium", "1 free professional session", "Personalized wellness plan", "24/7 priority support"]')
ON CONFLICT DO NOTHING;

alter publication supabase_realtime add table subscriptions;
alter publication supabase_realtime add table payments;