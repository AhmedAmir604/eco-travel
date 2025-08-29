-- Eco-Travel Planner: Likes Feature Database Schema
-- This file contains all the SQL commands needed to set up the likes functionality

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Create user_activity_likes table
CREATE TABLE IF NOT EXISTS user_activity_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_id VARCHAR NOT NULL,
    activity_name VARCHAR NOT NULL,
    activity_location VARCHAR,
    activity_image_url VARCHAR,
    activity_price JSONB, -- Store price as JSON: {"amount": 25, "currency": "USD"}
    activity_rating DECIMAL(3,2),
    activity_description TEXT,
    activity_source VARCHAR DEFAULT 'amadeus', -- 'amadeus', 'fallback', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_activity_likes_user_id 
ON user_activity_likes(user_id);

-- Index for fast activity lookups
CREATE INDEX IF NOT EXISTS idx_user_activity_likes_activity_id 
ON user_activity_likes(activity_id);

-- Composite index for user-activity combinations (most common query)
CREATE INDEX IF NOT EXISTS idx_user_activity_likes_user_activity 
ON user_activity_likes(user_id, activity_id);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_user_activity_likes_created_at 
ON user_activity_likes(created_at DESC);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on the table
ALTER TABLE user_activity_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own likes
CREATE POLICY "Users can view their own likes" 
ON user_activity_likes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own likes
CREATE POLICY "Users can insert their own likes" 
ON user_activity_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own likes
CREATE POLICY "Users can delete their own likes" 
ON user_activity_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policy: Users can only update their own likes
CREATE POLICY "Users can update their own likes" 
ON user_activity_likes 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. UNIQUE CONSTRAINTS
-- =====================================================

-- Ensure a user can only like an activity once
ALTER TABLE user_activity_likes 
ADD CONSTRAINT unique_user_activity_like 
UNIQUE (user_id, activity_id);

-- =====================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_activity_likes_updated_at 
    BEFORE UPDATE ON user_activity_likes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. USEFUL FUNCTIONS (OPTIONAL)
-- =====================================================

-- Function to get user's liked activities count
CREATE OR REPLACE FUNCTION get_user_likes_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM user_activity_likes 
        WHERE user_id = target_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user likes a specific activity
CREATE OR REPLACE FUNCTION is_activity_liked(target_user_id UUID, target_activity_id VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_activity_likes 
        WHERE user_id = target_user_id 
        AND activity_id = target_activity_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. SAMPLE QUERIES FOR TESTING
-- =====================================================

/*
-- Get all likes for a user
SELECT * FROM user_activity_likes 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC;

-- Check if user likes specific activity
SELECT is_activity_liked('your-user-id', 'activity-123');

-- Get user's total likes count
SELECT get_user_likes_count('your-user-id');

-- Get most liked activities (requires aggregation)
SELECT 
    activity_id, 
    activity_name, 
    COUNT(*) as like_count,
    array_agg(DISTINCT activity_location) as locations
FROM user_activity_likes 
GROUP BY activity_id, activity_name 
ORDER BY like_count DESC 
LIMIT 10;
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- This schema provides:
-- 1. Secure user-specific likes with RLS
-- 2. Fast querying with proper indexes
-- 3. Automatic timestamp management
-- 4. Duplicate prevention
-- 5. Helper functions for common operations
-- 6. Optimized for the eco-travel use case