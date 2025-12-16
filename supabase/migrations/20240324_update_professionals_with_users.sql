UPDATE public.professionals
SET 
  user_id = (SELECT id FROM public.users WHERE email = 'sarah.johnson@example.com' LIMIT 1),
  specialization = 'Clinical Psychology',
  bio = 'Specializing in cognitive behavioral therapy and anxiety disorders with over 15 years of experience helping clients achieve mental wellness.'
WHERE id IN (SELECT id FROM public.professionals WHERE bio LIKE '%cognitive behavioral therapy%' LIMIT 1);

UPDATE public.professionals
SET 
  user_id = (SELECT id FROM public.users WHERE email = 'michael.chen@example.com' LIMIT 1),
  specialization = 'Family Therapy',
  bio = 'Expert in family therapy and relationship counseling. Passionate about helping individuals and couples build stronger connections.'
WHERE id IN (SELECT id FROM public.professionals WHERE bio LIKE '%family therapy%' LIMIT 1);

UPDATE public.professionals
SET 
  user_id = (SELECT id FROM public.users WHERE email = 'emily.rodriguez@example.com' LIMIT 1),
  specialization = 'Psychiatry',
  bio = 'Comprehensive psychiatric care including medication management and therapy for depression, anxiety, and bipolar disorder.'
WHERE id IN (SELECT id FROM public.professionals WHERE bio LIKE '%psychiatric care%' LIMIT 1);
