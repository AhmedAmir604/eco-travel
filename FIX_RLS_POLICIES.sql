-- Fix RLS policies to prevent infinite recursion
-- The issue was admin policies were querying the profiles table from within profiles table policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- First, we need to create a function to safely check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use a more direct approach that doesn't cause recursion
  RETURN COALESCE(auth.jwt() ->> 'role', '') = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative function for checking admin role using raw user metadata
CREATE OR REPLACE FUNCTION is_admin_by_metadata()
RETURNS BOOLEAN AS $$
DECLARE
  user_role text;
BEGIN
  SELECT COALESCE(raw_user_meta_data->>'role', 'user') INTO user_role
  FROM auth.users 
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new, working policies without recursion
-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (but not role)
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND (role IS NULL OR role = OLD.role OR is_admin_by_metadata()));

-- Allow system/triggers to insert profiles during signup
CREATE POLICY "Allow profile creation during signup" ON profiles
  FOR INSERT WITH CHECK (true);

-- Drop all existing admin policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admin role full access" ON profiles;

-- Create a simple function to check if current user is admin
-- This uses SECURITY DEFINER to bypass RLS when checking the role
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Use SECURITY DEFINER context to bypass RLS for this check
  SELECT role INTO user_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user') = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION current_user_is_admin() TO authenticated;

-- Simple admin policy using the helper function
CREATE POLICY "Admins have full access to all profiles" ON profiles
  FOR ALL 
  USING (current_user_is_admin());

-- Create profiles for existing users who don't have profiles yet
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

-- Set admin role for your email (update this with your actual email)
UPDATE profiles SET role = 'admin' WHERE email = 'ahmadshahzad.9038@gmail.com';

-- Alternative: If you want to use JWT claims for admin detection, 
-- you'll need to update the user metadata when promoting to admin:
-- UPDATE auth.users 
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'ahmadshahzad.9038@gmail.com';

-- Create an updated trigger function that also updates user metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, last_sign_in_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.last_sign_in_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger function to sync role changes to user metadata
CREATE OR REPLACE FUNCTION sync_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- When role changes in profiles, update user metadata
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync role changes
DROP TRIGGER IF EXISTS sync_role_to_user_metadata ON profiles;
CREATE TRIGGER sync_role_to_user_metadata
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_role_to_metadata();