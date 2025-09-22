-- Undo the recent RLS policy changes

-- Drop the new function and policy
DROP POLICY IF EXISTS "Admins have full access to all profiles" ON profiles;
DROP FUNCTION IF EXISTS current_user_is_admin();

-- Recreate the original admin policies using the metadata function
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin_by_metadata());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin_by_metadata());

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (is_admin_by_metadata());

-- Make sure the metadata function has execution permissions
GRANT EXECUTE ON FUNCTION is_admin_by_metadata() TO authenticated;