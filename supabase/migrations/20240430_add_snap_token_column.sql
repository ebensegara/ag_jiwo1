ALTER TABLE payments ADD COLUMN IF NOT EXISTS snap_token TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS midtrans_response JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_ref_code_unique ON payments(ref_code) WHERE ref_code IS NOT NULL;
