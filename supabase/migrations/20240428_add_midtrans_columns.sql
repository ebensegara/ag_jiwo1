ALTER TABLE payments ADD COLUMN IF NOT EXISTS midtrans_response JSONB;
ALTER TABLE payments ADD CONSTRAINT unique_ref_code UNIQUE (ref_code);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_ref TEXT;

ALTER TABLE subscriptions ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('pending', 'active', 'expired', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_bookings_payment_ref ON bookings(payment_ref);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_ref ON subscriptions(payment_ref);
