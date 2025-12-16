-- Delete existing test data first
DELETE FROM public.professionals WHERE contact_email LIKE '%@jiwo.ai';

-- Insert new professionals data
INSERT INTO public.professionals (title, specialization, bio, rating, photo_url, contact_email) VALUES
('Dr. Sarah Mitchell - Clinical Psychologist', 'Clinical Psychology', 'PhD, Licensed Clinical Psychologist. Specializing in cognitive behavioral therapy with 15 years of experience helping clients overcome anxiety and depression.', 4.9, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'sarah.mitchell@jiwo.ai'),
('Dr. James Chen - Clinical Psychologist', 'Clinical Psychology', 'PsyD, Clinical Psychologist. Expert in trauma-focused therapy and EMDR. Passionate about helping clients heal from past experiences.', 4.8, 'https://api.dicebear.com/7.x/avataaars/svg?seed=james', 'james.chen@jiwo.ai'),
('Dr. Emily Rodriguez - Clinical Psychologist', 'Clinical Psychology', 'PhD, Clinical Psychologist. Specializes in mindfulness-based cognitive therapy for stress management and emotional regulation.', 4.7, 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily', 'emily.rodriguez@jiwo.ai'),

('Maria Santos - Family Therapist', 'Family Therapy', 'LMFT, Family Therapist. Dedicated to strengthening family bonds and improving communication. 10+ years experience in family therapy.', 4.8, 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', 'maria.santos@jiwo.ai'),
('Dr. Robert Kim - Marriage & Family Therapist', 'Family Therapy', 'PhD, Marriage & Family Therapist. Helping couples and families navigate conflicts and build stronger relationships through evidence-based approaches.', 4.9, 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', 'robert.kim@jiwo.ai'),
('Lisa Thompson - Family Counselor', 'Family Therapy', 'LMFT, Family Counselor. Specializing in blended families, parenting challenges, and adolescent issues. Warm and supportive approach.', 4.7, 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', 'lisa.thompson@jiwo.ai'),

('Dr. Michael Anderson - Psychiatrist', 'Psychiatry', 'MD, Board-Certified Psychiatrist. Providing comprehensive psychiatric care with focus on medication management and holistic treatment approaches.', 4.9, 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael', 'michael.anderson@jiwo.ai'),
('Dr. Jennifer Lee - Psychiatrist', 'Psychiatry', 'MD, Psychiatrist. Specializing in mood disorders, anxiety, and integrative psychiatry. Combining medication with therapy approaches.', 4.8, 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer', 'jennifer.lee@jiwo.ai'),
('Dr. David Brown - Psychiatrist', 'Psychiatry', 'MD, Psychiatrist. Expert in treatment-resistant depression and anxiety disorders. Evidence-based medication management.', 4.7, 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', 'david.brown@jiwo.ai'),

('Dr. Amanda Foster - Child Psychiatrist', 'Child & Adolescent Psychiatry', 'MD, Child & Adolescent Psychiatrist. Specialized care for children and adolescents with ADHD, anxiety, and mood disorders. Family-centered approach.', 4.9, 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda', 'amanda.foster@jiwo.ai'),
('Dr. Kevin Park - Child Psychiatrist', 'Child & Adolescent Psychiatry', 'MD, Child Psychiatrist. Helping young people navigate mental health challenges with compassionate, age-appropriate care.', 4.8, 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin', 'kevin.park@jiwo.ai'),
('Dr. Rachel Green - Adolescent Psychiatrist', 'Child & Adolescent Psychiatry', 'MD, Adolescent Psychiatrist. Specializing in teen mental health, school-related stress, and developmental challenges.', 4.7, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rachel', 'rachel.green@jiwo.ai'),

('John Williams - Life Coach', 'Life Coaching', 'Certified Life Coach, ICF. Empowering individuals to achieve their goals and live their best lives. Specializing in career transitions and personal growth.', 4.8, 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 'john.williams@jiwo.ai'),
('Sarah Martinez - Life Coach', 'Life Coaching', 'Professional Life Coach. Helping clients discover their purpose and create actionable plans for success. Focus on work-life balance.', 4.7, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahm', 'sarah.martinez@jiwo.ai'),
('Tom Jackson - Executive Coach', 'Life Coaching', 'Executive & Life Coach. Supporting professionals in leadership development, stress management, and achieving peak performance.', 4.9, 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom', 'tom.jackson@jiwo.ai'),

('Dr. Nicole White - Nutritionist', 'Nutrition & Wellness', 'RD, Nutritionist & Wellness Coach. Integrating nutrition science with mental wellness. Specializing in eating disorders and stress-related eating patterns.', 4.8, 'https://api.dicebear.com/7.x/avataaars/svg?seed=nicole', 'nicole.white@jiwo.ai'),
('Emma Davis - Nutritionist', 'Nutrition & Wellness', 'Certified Nutritionist. Holistic approach to nutrition and wellness. Helping clients develop healthy relationships with food.', 4.7, 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', 'emma.davis@jiwo.ai'),
('Dr. Alex Turner - Nutrition Specialist', 'Nutrition & Wellness', 'PhD, Nutrition & Mental Health. Research-based approach to nutrition for mental wellness. Expert in gut-brain connection and mood-food relationships.', 4.9, 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 'alex.turner@jiwo.ai');
