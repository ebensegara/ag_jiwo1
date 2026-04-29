-- Migration to add availability_slots table and update professionals/bookings tables

-- 1. Create availability_slots table
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_time > start_time)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_availability_slots_professional_id ON availability_slots(professional_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day_of_week ON availability_slots(day_of_week);

-- 2. Update professionals table
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS title TEXT;
-- hourly_rate is conceptually price_per_session in the current schema, 
-- but we can add it as a separate column if we want to differentiate.
-- PRD says price_per_session is already there. bookingsystem.md says hourly_rate.
-- I'll stick with price_per_session but add title.
-- hourly_rate is explicitly mentioned in bookingsystem.md
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL;

-- 3. Update bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded'));

-- Sync start_time with session_time if start_time is null
UPDATE bookings SET start_time = session_time WHERE start_time IS NULL;

-- 4. RLS Policies for availability_slots
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Professionals can manage their own slots
CREATE POLICY "Professionals can manage their own availability slots"
  ON availability_slots
  FOR ALL
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

-- Everyone (authenticated) can view availability slots to book
CREATE POLICY "Anyone can view availability slots"
  ON availability_slots
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Realtime for availability_slots
ALTER PUBLICATION supabase_realtime ADD TABLE availability_slots;

-- 6. Trigger for updated_at
CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
