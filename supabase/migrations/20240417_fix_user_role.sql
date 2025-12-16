UPDATE users 
SET role = 'user' 
WHERE id = '616c2fd9-fff2-4851-9781-cca332eb95f8' 
AND role != 'user';

SELECT id, email, role, full_name 
FROM users 
WHERE id = '616c2fd9-fff2-4851-9781-cca332eb95f8';
