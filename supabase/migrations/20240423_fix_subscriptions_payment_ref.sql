ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_ref TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_ref ON subscriptions(payment_ref);
