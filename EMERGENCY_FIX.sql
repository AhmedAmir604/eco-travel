-- EMERGENCY FIX: Remove all triggers to fix signup

-- Step 1: Remove ALL triggers that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_user_update() CASCADE;

-- Step 2: Disable RLS temporarily to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Create profiles for existing users
INSERT INTO profiles (id, email, full_name, created_at, last_sign_in_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 4: Make yourself admin
UPDATE profiles SET role = 'admin' WHERE email = 'ahmadshahzad.9038@gmail.com';

-- Step 5: Re-enable RLS with simple policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Simple policies that won't interfere
CREATE POLICY "Allow all operations for now" ON profiles FOR ALL USING (true);