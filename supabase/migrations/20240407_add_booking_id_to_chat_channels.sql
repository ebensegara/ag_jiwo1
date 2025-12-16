ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chat_channels_booking_id ON chat_channels(booking_id);
