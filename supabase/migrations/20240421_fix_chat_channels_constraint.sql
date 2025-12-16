ALTER TABLE chat_channels 
DROP CONSTRAINT IF EXISTS chat_channels_user_id_professional_id_booking_id_key;

CREATE UNIQUE INDEX chat_channels_user_professional_unique 
ON chat_channels(user_id, professional_id) 
WHERE booking_id IS NULL;

CREATE UNIQUE INDEX chat_channels_user_professional_booking_unique 
ON chat_channels(user_id, professional_id, booking_id) 
WHERE booking_id IS NOT NULL;