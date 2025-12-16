ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_professionals_is_available ON public.professionals(is_available);

UPDATE public.professionals SET is_available = false WHERE is_available IS NULL;
