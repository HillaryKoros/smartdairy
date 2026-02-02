-- Sample Users for Koimeret Dairies
-- Run this SQL after initdb to create sample users

-- First, ensure roles exist
INSERT INTO farm_role (name, description, created_at, modified_at) VALUES
('auditor', 'Financial auditor with read-only access', NOW(), NOW()),
('procurement', 'Procurement officer for supplies and purchases', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Get the farm ID (assuming Koimeret Dairies)
-- You may need to adjust this based on your actual farm ID

-- Create sample users
-- Password hash for 'worker123' (using Django's PBKDF2)
-- Note: You'll need to generate proper password hashes or reset passwords after insert

-- Worker 1: John Kipchoge
INSERT INTO core_user (phone, full_name, is_active, is_staff, is_superuser, date_joined, password)
VALUES ('0711111111', 'John Kipchoge', true, false, false, NOW(),
        'pbkdf2_sha256$720000$placeholder$worker123hash')
ON CONFLICT (phone) DO NOTHING;

-- Worker 2: Mary Wanjiku
INSERT INTO core_user (phone, full_name, is_active, is_staff, is_superuser, date_joined, password)
VALUES ('0722222222', 'Mary Wanjiku', true, false, false, NOW(),
        'pbkdf2_sha256$720000$placeholder$worker123hash')
ON CONFLICT (phone) DO NOTHING;

-- Vet: Dr. Peter Ochieng
INSERT INTO core_user (phone, full_name, is_active, is_staff, is_superuser, date_joined, password)
VALUES ('0733333333', 'Dr. Peter Ochieng', true, false, false, NOW(),
        'pbkdf2_sha256$720000$placeholder$vet12345hash')
ON CONFLICT (phone) DO NOTHING;

-- Auditor: Sarah Kimani
INSERT INTO core_user (phone, full_name, is_active, is_staff, is_superuser, date_joined, password)
VALUES ('0744444444', 'Sarah Kimani', true, false, false, NOW(),
        'pbkdf2_sha256$720000$placeholder$auditor123hash')
ON CONFLICT (phone) DO NOTHING;

-- Procurement: James Mwangi
INSERT INTO core_user (phone, full_name, is_active, is_staff, is_superuser, date_joined, password)
VALUES ('0755555555', 'James Mwangi', true, false, false, NOW(),
        'pbkdf2_sha256$720000$placeholder$procure123hash')
ON CONFLICT (phone) DO NOTHING;

-- Create farm memberships (linking users to farm with roles)
-- Run after users are created

INSERT INTO farm_farmmembership (user_id, farm_id, role_id, is_active, joined_at, created_at, modified_at)
SELECT u.id, f.id, r.id, true, NOW(), NOW(), NOW()
FROM core_user u, farm_farm f, farm_role r
WHERE u.phone = '0711111111' AND f.name = 'Koimeret Dairies' AND r.name = 'worker'
ON CONFLICT DO NOTHING;

INSERT INTO farm_farmmembership (user_id, farm_id, role_id, is_active, joined_at, created_at, modified_at)
SELECT u.id, f.id, r.id, true, NOW(), NOW(), NOW()
FROM core_user u, farm_farm f, farm_role r
WHERE u.phone = '0722222222' AND f.name = 'Koimeret Dairies' AND r.name = 'worker'
ON CONFLICT DO NOTHING;

INSERT INTO farm_farmmembership (user_id, farm_id, role_id, is_active, joined_at, created_at, modified_at)
SELECT u.id, f.id, r.id, true, NOW(), NOW(), NOW()
FROM core_user u, farm_farm f, farm_role r
WHERE u.phone = '0733333333' AND f.name = 'Koimeret Dairies' AND r.name = 'vet'
ON CONFLICT DO NOTHING;

INSERT INTO farm_farmmembership (user_id, farm_id, role_id, is_active, joined_at, created_at, modified_at)
SELECT u.id, f.id, r.id, true, NOW(), NOW(), NOW()
FROM core_user u, farm_farm f, farm_role r
WHERE u.phone = '0744444444' AND f.name = 'Koimeret Dairies' AND r.name = 'auditor'
ON CONFLICT DO NOTHING;

INSERT INTO farm_farmmembership (user_id, farm_id, role_id, is_active, joined_at, created_at, modified_at)
SELECT u.id, f.id, r.id, true, NOW(), NOW(), NOW()
FROM core_user u, farm_farm f, farm_role r
WHERE u.phone = '0755555555' AND f.name = 'Koimeret Dairies' AND r.name = 'procurement'
ON CONFLICT DO NOTHING;

-- Update active_farm for all users
UPDATE core_user SET active_farm_id = (SELECT id FROM farm_farm WHERE name = 'Koimeret Dairies' LIMIT 1)
WHERE phone IN ('0711111111', '0722222222', '0733333333', '0744444444', '0755555555');

/*
Sample Users Summary:
---------------------
| Role        | Phone       | Password    | Name              |
|-------------|-------------|-------------|-------------------|
| Admin       | 0700000000  | admin123    | Farm Administrator|
| Worker      | 0711111111  | worker123   | John Kipchoge     |
| Worker      | 0722222222  | worker123   | Mary Wanjiku      |
| Vet         | 0733333333  | vet12345    | Dr. Peter Ochieng |
| Auditor     | 0744444444  | auditor123  | Sarah Kimani      |
| Procurement | 0755555555  | procure123  | James Mwangi      |
---------------------

NOTE: The password hashes above are placeholders.
To set proper passwords, use Django shell:

docker compose exec cms python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> for phone, pwd in [('0711111111','worker123'),('0722222222','worker123'),('0733333333','vet12345'),('0744444444','auditor123'),('0755555555','procure123')]:
...     u = User.objects.get(phone=phone)
...     u.set_password(pwd)
...     u.save()
*/
