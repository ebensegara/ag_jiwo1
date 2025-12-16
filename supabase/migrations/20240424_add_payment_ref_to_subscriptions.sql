ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_ref TEXT;

CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_ref ON subscriptions(payment_ref);
