UPDATE public.professionals
SET specialization = 'Clinical Psychology'
WHERE bio LIKE '%cognitive behavioral therapy%' AND specialization IS NULL;

UPDATE public.professionals
SET specialization = 'Family Therapy'
WHERE bio LIKE '%family therapy%' AND specialization IS NULL;

UPDATE public.professionals
SET specialization = 'Psychiatry'
WHERE bio LIKE '%psychiatric care%' AND specialization IS NULL;

UPDATE public.professionals
SET specialization = 'Child & Adolescent Psychiatry'
WHERE bio LIKE '%children and adolescents%' AND specialization IS NULL;

UPDATE public.professionals
SET specialization = 'Life Coaching'
WHERE bio LIKE '%coaching%' AND specialization IS NULL;

UPDATE public.professionals
SET specialization = 'Nutrition & Wellness'
WHERE bio LIKE '%nutrition%' AND specialization IS NULL;