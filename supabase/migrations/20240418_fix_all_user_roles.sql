-- Update ALL users to have role 'user' except those who are professionals or admins
UPDATE users 
SET role = 'user' 
WHERE role IS NULL OR role NOT IN ('admin', 'professional', 'company_admin');

-- Show all users with their roles
SELECT id, email, role, full_name 
FROM users 
ORDER BY created_at DESC;
