ALTER TABLE public.screenings 
ADD COLUMN IF NOT EXISTS result_data JSONB;

ALTER TABLE public.screenings 
ALTER COLUMN score DROP NOT NULL;
