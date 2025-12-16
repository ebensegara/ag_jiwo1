INSERT INTO public.companies (id, name, industry, employee_count, admin_email, subscription_plan, subscription_status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Tech Innovators Inc', 'Technology', 150, 'admin@techinnovators.com', 'enterprise', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Creative Solutions Ltd', 'Marketing', 80, 'hr@creativesolutions.com', 'business', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'Finance Pro Corp', 'Finance', 200, 'admin@financepro.com', 'enterprise', 'active');

INSERT INTO public.company_alerts (company_id, alert_type, severity, title, description, department)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'low_engagement', 'warning', 'Marketing Team - Decreased Engagement', 'Marketing team showing 30% decrease in wellness app usage this week', 'Marketing'),
  ('11111111-1111-1111-1111-111111111111', 'stress_peak', 'critical', 'Monday Morning Stress Pattern', 'Stress levels consistently peak on Monday mornings at 10 AM', NULL),
  ('22222222-2222-2222-2222-222222222222', 'positive_trend', 'info', 'Wellness Improvement', 'Overall employee wellness trending positively this month', NULL);
