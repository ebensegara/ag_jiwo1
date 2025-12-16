ALTER TABLE professionals ADD COLUMN IF NOT EXISTS price_per_session NUMERIC DEFAULT 150000;

UPDATE professionals SET price_per_session = 150000 WHERE category = 'Psychologist';
UPDATE professionals SET price_per_session = 200000 WHERE category = 'Psychiatrist';
UPDATE professionals SET price_per_session = 120000 WHERE category = 'Life Coaching';
UPDATE professionals SET price_per_session = 100000 WHERE category = 'Nutrition';
UPDATE professionals SET price_per_session = 80000 WHERE category = 'Yoga';
UPDATE professionals SET price_per_session = 90000 WHERE category = 'Art Therapy';
