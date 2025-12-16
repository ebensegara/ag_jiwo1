DO $$
DECLARE
  company_uuid uuid := gen_random_uuid();
  user_uuid uuid := gen_random_uuid();
  admin_uuid uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.companies (id, name, industry, employee_count, admin_email, created_at)
  VALUES (
    company_uuid,
    'Hughes Network System',
    'Telecommunications',
    50,
    'admin@hns.com',
    NOW()
  );

  INSERT INTO public.users (id, email, full_name, role, company_id, created_at)
  VALUES (
    user_uuid,
    'admin@hns.com',
    'HNS Admin',
    'user',
    company_uuid,
    NOW()
  );

  INSERT INTO public.company_admins (id, company_id, user_id, role, created_at)
  VALUES (
    admin_uuid,
    company_uuid,
    user_uuid,
    'admin',
    NOW()
  );

  INSERT INTO public.employees (id, company_id, user_id, department, position, created_at)
  VALUES (
    gen_random_uuid(),
    company_uuid,
    user_uuid,
    'Management',
    'HR Admin',
    NOW()
  );

  INSERT INTO public.mood_check_ins (id, user_id, mood_score, energy_level, stress_level, notes, created_at)
  VALUES
    (gen_random_uuid(), user_uuid, 8, 7, 3, 'Feeling productive today', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), user_uuid, 7, 6, 4, 'Good work-life balance', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), user_uuid, 9, 8, 2, 'Great team collaboration', NOW() - INTERVAL '3 days');
END $$;