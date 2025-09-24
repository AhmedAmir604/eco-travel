# Admin Setup Guide

## Step 1: Create the Profiles Table

Go to your Supabase dashboard → SQL Editor and run this SQL:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle new user registration
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

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update profile on user update
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    email = NEW.email,
    last_sign_in_at = NEW.last_sign_in_at,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();
```

## Step 2: Create Your Admin Account

1. First, sign up for an account using the normal signup process
2. After signing up, go to Supabase dashboard → SQL Editor and run:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Step 3: Access Admin Panel

1. Sign in with your account
2. Navigate to `/admin`
3. You should now have access to the admin panel!

## Troubleshooting

### If you get "profiles table not found" error:
- Make sure you ran Step 1 SQL in your Supabase dashboard
- Check that the table was created in the Table Editor

### If you can't access admin panel:
- Make sure you ran Step 2 to set your role to 'admin'
- Check your email matches exactly in the profiles table
- Try signing out and signing back in

### If existing users don't have profiles:
Run this to create profiles for existing users:
```sql
INSERT INTO profiles (id, email, full_name, created_at, last_sign_in_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', ''),
  created_at,
  last_sign_in_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```