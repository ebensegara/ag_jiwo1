-- Drop the partial indexes
DROP INDEX IF EXISTS chat_channels_user_professional_unique;
DROP INDEX IF EXISTS chat_channels_user_professional_booking_unique;

-- Create a simple unique constraint on user_id and professional_id only
-- This allows multiple channels with different booking_ids
ALTER TABLE chat_channels 
DROP CONSTRAINT IF EXISTS chat_channels_user_id_professional_id_booking_id_key;

-- Add the new constraint that matches the ON CONFLICT clause
ALTER TABLE chat_channels
ADD CONSTRAINT chat_channels_user_professional_key 
UNIQUE (user_id, professional_id);
