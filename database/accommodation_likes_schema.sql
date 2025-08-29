-- Eco-Travel Planner: Accommodation Likes Feature Database Schema
-- This file contains all the SQL commands needed to set up the accommodation likes functionality

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Create user_accommodation_likes table
CREATE TABLE IF NOT EXISTS user_accommodation_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    accommodation_id VARCHAR NOT NULL,
    accommodation_name VARCHAR NOT NULL,
    accommodation_location VARCHAR,
    accommodation_image_url VARCHAR,
    accommodation_price JSONB, -- Store price as JSON: {"amount": 150, "currency": "USD", "per": "night"}
    accommodation_rating DECIMAL(3,2),
    accommodation_eco_rating DECIMAL(3,2),
    accommodation_description TEXT,
    accommodation_chain_code VARCHAR,
    accommodation_features JSONB, -- Store eco features as JSON array
    accommodation_amenities JSONB, -- Store amenities as JSON array
    accommodation_coordinates JSONB, -- Store lat/lng as JSON: {"latitude": 48.8566, "longitude": 2.3522}
    accommodation_source VARCHAR DEFAULT 'amadeus', -- 'amadeus', 'google_places', 'fallback', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_accommodation_likes_user_id 
ON user_accommodation_likes(user_id);

-- Index for fast accommodation lookups
CREATE INDEX IF NOT EXISTS idx_user_accommodation_likes_accommodation_id 
ON user_accommodation_likes(accommodation_id);

-- Composite index for user-accommodation combinations (most common query)
CREATE INDEX IF NOT EXISTS idx_user_accommodation_likes_user_accommodation 
ON user_accommodation_likes(user_id, accommodation_id);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_user_accommodation_likes_created_at 
ON user_accommodation_likes(created_at DESC);

-- Index for eco rating filtering
CREATE INDEX IF NOT EXISTS idx_user_accommodation_likes_eco_rating 
ON user_accommodation_likes(accommodation_eco_rating DESC);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on the table
ALTER TABLE user_accommodation_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own likes
CREATE POLICY "Users can view their own accommodation likes" 
ON user_accommodation_likes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own likes
CREATE POLICY "Users can insert their own accommodation likes" 
ON user_accommodation_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own likes
CREATE POLICY "Users can delete their own accommodation likes" 
ON user_accommodation_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policy: Users can only update their own likes
CREATE POLICY "Users can update their own accommodation likes" 
ON user_accommodation_likes 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. UNIQUE CONSTRAINTS
-- =====================================================

-- Ensure a user can only like an accommodation once
ALTER TABLE user_accommodation_likes 
ADD CONSTRAINT unique_user_accommodation_like 
UNIQUE (user_id, accommodation_id);

-- =====================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_accommodation_likes_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_accommodation_likes_updated_at 
    BEFORE UPDATE ON user_accommodation_likes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_accommodation_likes_updated_at_column();

-- =====================================================
-- 6. USEFUL FUNCTIONS (OPTIONAL)
-- =====================================================

-- Function to get user's liked accommodations count
CREATE OR REPLACE FUNCTION get_user_accommodation_likes_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM user_accommodation_likes 
        WHERE user_id = target_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user likes a specific accommodation
CREATE OR REPLACE FUNCTION is_accommodation_liked(target_user_id UUID, target_accommodation_id VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_accommodation_likes 
        WHERE user_id = target_user_id 
        AND accommodation_id = target_accommodation_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get most liked accommodations
CREATE OR REPLACE FUNCTION get_popular_accommodations(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    accommodation_id VARCHAR,
    accommodation_name VARCHAR,
    accommodation_location VARCHAR,
    like_count BIGINT,
    avg_eco_rating DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ual.accommodation_id,
        ual.accommodation_name,
        ual.accommodation_location,
        COUNT(*) as like_count,
        AVG(ual.accommodation_eco_rating) as avg_eco_rating
    FROM user_accommodation_likes ual
    GROUP BY ual.accommodation_id, ual.accommodation_name, ual.accommodation_location
    ORDER BY like_count DESC, avg_eco_rating DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. SAMPLE QUERIES FOR TESTING
-- =====================================================

/*
-- Get all accommodation likes for a user
SELECT * FROM user_accommodation_likes 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC;

-- Check if user likes specific accommodation
SELECT is_accommodation_liked('your-user-id', 'accommodation-123');

-- Get user's total accommodation likes count
SELECT get_user_accommodation_likes_count('your-user-id');

-- Get most popular accommodations
SELECT * FROM get_popular_accommodations(5);

-- Get accommodations with highest eco ratings
SELECT 
    accommodation_name,
    accommodation_location,
    accommodation_eco_rating,
    COUNT(*) as like_count
FROM user_accommodation_likes 
WHERE accommodation_eco_rating >= 4.0
GROUP BY accommodation_id, accommodation_name, accommodation_location, accommodation_eco_rating 
ORDER BY accommodation_eco_rating DESC, like_count DESC 
LIMIT 10;

-- Get eco-friendly accommodations by features
SELECT 
    accommodation_name,
    accommodation_features,
    accommodation_eco_rating
FROM user_accommodation_likes 
WHERE accommodation_features ? 'Solar Power' 
   OR accommodation_features ? 'Energy Efficient'
GROUP BY accommodation_id, accommodation_name, accommodation_features, accommodation_eco_rating
ORDER BY accommodation_eco_rating DESC;
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- This schema provides:
-- 1. Secure user-specific accommodation likes with RLS
-- 2. Fast querying with proper indexes
-- 3. Automatic timestamp management
-- 4. Duplicate prevention
-- 5. Helper functions for common operations
-- 6. Support for rich accommodation data (eco ratings, features, amenities)
-- 7. Optimized for the eco-travel accommodation use case
-- 8. Integration with existing user_activity_likes structure