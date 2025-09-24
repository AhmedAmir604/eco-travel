# 🚀 Eco-Travel Planner: Likes Feature Setup Guide

This guide will help you implement the complete likes feature for destinations in your Eco-Travel Planner application.

## 📋 Prerequisites

- Supabase project set up
- Next.js 14 application running
- User authentication already implemented

## 🗄️ Step 1: Database Setup

### 1.1 Run the Database Schema

Navigate to your Supabase project dashboard and run the SQL commands from `database/likes_schema.sql`:

1. Go to your Supabase project → SQL Editor
2. Copy and paste the entire content from `database/likes_schema.sql`
3. Click "Run" to execute all commands

This will create:
- `user_activity_likes` table
- Proper indexes for performance
- Row Level Security (RLS) policies
- Helper functions
- Triggers for timestamp management

### 1.2 Verify Database Setup

Run this query to verify the table was created:

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_activity_likes';
```

## 🔧 Step 2: Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Step 3: File Structure

Your project should now have these new files:

```
├── app/
│   └── api/
│       └── likes/
│           └── route.js                 # Likes API endpoints
├── components/
│   └── LikeButton.jsx                  # Reusable like button
├── hooks/
│   └── useLikes.js                     # Likes management hook
├── database/
│   └── likes_schema.sql                # Database schema
└── app/
    └── favorites/
        └── page.jsx                    # My Favorites page (coming next)
```

## 🚦 Step 4: Testing the Implementation

### 4.1 Test API Endpoints

1. **Check Like Status:**
   ```bash
   GET /api/likes?activityId=your-activity-id
   ```

2. **Add Like:**
   ```bash
   POST /api/likes
   Content-Type: application/json
   
   {
     "activityId": "123",
     "activityName": "Eco Tour",
     "activityLocation": "Paris",
     "activityImageUrl": "/image.jpg",
     "activityPrice": {"amount": 25, "currency": "USD"},
     "activityRating": 4.5,
     "activityDescription": "Great eco tour"
   }
   ```

3. **Remove Like:**
   ```bash
   DELETE /api/likes?activityId=your-activity-id
   ```

### 4.2 Test UI Components

1. Navigate to `/destinations`
2. Search for activities
3. Click the heart icon to like/unlike activities
4. Verify toast notifications appear
5. Check that likes persist after page refresh

## ⚡ Step 5: Performance Considerations

### 5.1 Database Optimization

The schema includes these optimizations:
- Composite index on `(user_id, activity_id)` for fast lookups
- Individual indexes on `user_id` and `activity_id`
- Unique constraint to prevent duplicate likes

### 5.2 Frontend Optimization

The implementation includes:
- Optimistic updates for instant feedback
- Lightweight `useLikeStatus` hook for individual components
- Proper error handling with rollback

## 🔐 Step 6: Security Features

### 6.1 Row Level Security (RLS)

The database enforces:
- Users can only see their own likes
- Users can only modify their own likes
- Automatic user ID validation

### 6.2 API Security

The API includes:
- Authentication verification
- Input validation
- Error handling
- Proper HTTP status codes

## 🎨 Step 7: Customization Options

### 7.1 Like Button Variants

```jsx
// Default button
<LikeButton activity={activity} />

// Minimal style
<LikeButton activity={activity} variant="minimal" />

// Floating action button
<LikeButton activity={activity} variant="fab" />

// With text
<LikeButton activity={activity} showText={true} />

// Different sizes
<LikeButton activity={activity} size="sm" />
<LikeButton activity={activity} size="lg" />
```

### 7.2 Hook Options

```jsx
// Full likes management
const { toggleLike, isLiked, getLikedActivities } = useLikes();

// Lightweight status check
const { isLiked, loading } = useLikeStatus(activityId);
```

## 🐛 Step 8: Troubleshooting

### 8.1 Common Issues

1. **"Authentication required" error:**
   - Verify user is logged in
   - Check Supabase client configuration

2. **"Database error" messages:**
   - Verify RLS policies are active
   - Check table permissions in Supabase

3. **Like button not updating:**
   - Check browser console for errors
   - Verify API endpoints are responding

### 8.2 Debug Tips

1. **Check API responses:**
   ```javascript
   // In browser console
   fetch('/api/likes?activityId=123')
     .then(r => r.json())
     .then(//);
   ```

2. **Verify database data:**
   ```sql
   SELECT * FROM user_activity_likes WHERE user_id = 'your-user-id';
   ```

## 🚀 Step 9: Next Steps

After completing this setup:

1. ✅ Test the likes functionality thoroughly
2. ✅ Create the "My Favorites" page (see favorites page implementation)
3. ✅ Add like counts to activity displays
4. ✅ Implement like statistics for users
5. ✅ Add export functionality for liked activities

## 📊 Step 10: Monitoring & Analytics

Consider adding:
- Like count tracking
- Popular activities analytics
- User engagement metrics
- Performance monitoring

## 🎉 Congratulations!

You now have a complete, production-ready likes feature that includes:
- ✅ Secure database schema
- ✅ RESTful API endpoints
- ✅ React hooks for state management
- ✅ Beautiful UI components
- ✅ Authentication integration
- ✅ Toast notifications
- ✅ Optimistic updates
- ✅ Error handling
- ✅ Performance optimization

Your users can now save their favorite eco-friendly activities and access them anytime!