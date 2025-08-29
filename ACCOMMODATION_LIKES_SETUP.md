# 🏨 Eco-Travel Planner: Accommodation Likes Feature Setup Guide

This guide will help you implement the complete accommodation likes feature for your Eco-Travel Planner application, exactly like the activities likes feature.

## 📋 Prerequisites

- Supabase project set up
- Next.js 14 application running
- User authentication already implemented
- Activity likes feature already working (for reference)

## 🗄️ Step 1: Database Setup

### 1.1 Run the Database Schema

Navigate to your Supabase project dashboard and run the SQL commands from `database/accommodation_likes_schema.sql`:

1. Go to your Supabase project → SQL Editor
2. Copy and paste the entire content from `database/accommodation_likes_schema.sql`
3. Click "Run" to execute all commands

This will create:
- `user_accommodation_likes` table with comprehensive accommodation data
- Proper indexes for performance (user_id, accommodation_id, eco_rating)
- Row Level Security (RLS) policies
- Helper functions for popular accommodations and statistics
- Triggers for timestamp management

### 1.2 Verify Database Setup

Run this query to verify the table was created:

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_accommodation_likes';
```

## 🔧 Step 2: API Endpoints

The API endpoints are already created at `/app/api/accommodation-likes/route.js`:

### Available Endpoints:

1. **POST `/api/accommodation-likes`** - Toggle like/unlike accommodation
2. **GET `/api/accommodation-likes?accommodationId=123`** - Check if accommodation is liked
3. **GET `/api/accommodation-likes?page=1&limit=10`** - Get user's liked accommodations
4. **DELETE `/api/accommodation-likes?accommodationId=123`** - Remove specific like

### API Response Format:

```json
{
  "success": true,
  "action": "liked" | "unliked",
  "isLiked": true | false,
  "message": "Accommodation liked successfully",
  "data": { /* accommodation data */ }
}
```

## 📁 Step 3: File Structure

Your project now includes these new accommodation files:

```
├── app/
│   ├── api/
│   │   └── accommodation-likes/
│   │       └── route.js                    # Accommodation likes API endpoints
│   └── accommodation-favorites/
│       └── page.jsx                        # Accommodation favorites page
├── components/
│   └── AccommodationLikeButton.jsx         # Reusable accommodation like button
├── hooks/
│   └── useAccommodationLikes.js            # Accommodation likes management hook
├── database/
│   └── accommodation_likes_schema.sql      # Database schema for accommodations
└── app/accommodations/
    └── page.jsx                            # Updated with like functionality
```

## 🎯 Step 4: Component Usage

### 4.1 AccommodationLikeButton Component

```jsx
import AccommodationLikeButton from '@/components/AccommodationLikeButton'

<AccommodationLikeButton 
  accommodation={{
    id: accommodation.id,
    name: accommodation.name,
    location: accommodation.location,
    image: accommodation.image,
    price: accommodation.price,
    rating: accommodation.rating,
    ecoRating: accommodation.ecoRating,
    description: accommodation.description,
    chainCode: accommodation.chainCode,
    features: accommodation.features,
    amenities: accommodation.amenities,
    coordinates: accommodation.coordinates,
    source: 'amadeus'
  }}
  size="md"
  variant="default"
/>
```

### 4.2 useAccommodationLikes Hook

```jsx
import { useAccommodationLikes } from '@/hooks/useAccommodationLikes'

const {
  toggleAccommodationLike,
  isAccommodationLiked,
  getLikedAccommodations,
  getAccommodationLikesCount,
  isAuthenticated
} = useAccommodationLikes()
```

## 🎨 Step 5: UI Features

### 5.1 Visual States

- **Liked**: Filled red heart with red border and background
- **Not Liked**: Empty gray heart with gray border
- **Loading**: Spinning loader icon
- **Hover**: Scale and color transitions

### 5.2 Toast Notifications

- ✨ **Like**: `"✨ "Hotel Name" added to your favorites! 🏨"`
- 💔 **Unlike**: `"💔 "Hotel Name" removed from favorites"`
- 🔒 **Auth Required**: `"Please sign in to save accommodations to your favorites"`
- ❌ **Error**: Custom error messages

### 5.3 Button Variants

```jsx
// Default style with border and background
<AccommodationLikeButton variant="default" />

// Minimal style without border
<AccommodationLikeButton variant="minimal" />

// Floating action button
<AccommodationLikeButton variant="fab" />

// With text label
<AccommodationLikeButton showText={true} />

// Different sizes
<AccommodationLikeButton size="sm" />
<AccommodationLikeButton size="md" />
<AccommodationLikeButton size="lg" />
```

## 🔐 Step 6: Security Features

### 6.1 Row Level Security (RLS)

- Users can only see their own accommodation likes
- Users can only modify their own accommodation likes
- Automatic user ID validation

### 6.2 API Security

- Authentication verification on all endpoints
- Input validation for all accommodation data
- Proper error handling and HTTP status codes
- SQL injection protection through Supabase

## 📊 Step 7: Data Structure

### 7.1 Accommodation Object Structure

```javascript
{
  id: string,                    // Unique accommodation identifier
  name: string,                  // Accommodation name
  location: string,              // Full address/location
  image: string,                 // Image URL
  price: {                       // Price information
    amount: number,
    currency: string,
    per: 'night'
  },
  rating: number,                // Star rating (1-5)
  ecoRating: number,             // Eco-friendliness rating (1-5)
  description: string,           // Accommodation description
  chainCode: string,             // Hotel chain code (if applicable)
  features: string[],            // Eco-friendly features array
  amenities: string[],           // Available amenities array
  coordinates: {                 // GPS coordinates
    latitude: number,
    longitude: number
  },
  source: string                 // Data source ('amadeus', 'fallback', etc.)
}
```

## 🚀 Step 8: Testing the Implementation

### 8.1 Basic Functionality Test

1. Navigate to `/accommodations` page
2. Search for accommodations in any city
3. Click the heart ❤️ icon on any accommodation
4. Verify toast notifications appear
5. Check that hearts fill/empty correctly
6. Visit `/accommodation-favorites` to see saved accommodations

### 8.2 Test API Endpoints

```bash
# Check if accommodation is liked
GET /api/accommodation-likes?accommodationId=hotel-123

# Toggle like status
POST /api/accommodation-likes
Content-Type: application/json
{
  "accommodationId": "hotel-123",
  "accommodationName": "Eco Hotel",
  "accommodationLocation": "Paris, France",
  // ... other accommodation data
}

# Get all user favorites
GET /api/accommodation-likes?page=1&limit=10
```

## 🎯 Step 9: Navigation Integration

Add accommodation favorites to your navigation menu:

```jsx
// In your navbar component
<Link href="/accommodation-favorites">
  My Accommodation Favorites ({getAccommodationLikesCount()})
</Link>
```

## 📈 Step 10: Analytics & Insights

Use the helper functions to track popular accommodations:

```sql
-- Get most popular accommodations
SELECT * FROM get_popular_accommodations(10);

-- Get eco-friendly accommodations with high ratings
SELECT 
  accommodation_name,
  accommodation_location,
  accommodation_eco_rating,
  COUNT(*) as like_count
FROM user_accommodation_likes 
WHERE accommodation_eco_rating >= 4.0
GROUP BY accommodation_id, accommodation_name, accommodation_location, accommodation_eco_rating 
ORDER BY accommodation_eco_rating DESC, like_count DESC;
```

## 🔄 Step 11: Integration with Activities

The accommodation likes work independently but complement the activity likes:

- Shared global toast system
- Similar UI patterns and user experience
- Consistent authentication flow
- Compatible favorites management

## 🐛 Step 12: Troubleshooting

### Common Issues:

1. **"Authentication required" error**:
   - Verify user is logged in
   - Check Supabase client configuration

2. **Database errors**:
   - Verify RLS policies are active
   - Check table permissions in Supabase
   - Ensure accommodation_likes_schema.sql was run

3. **Toast notifications not appearing**:
   - Check that global ToastContext is properly set up
   - Verify ToastContainer is in the layout

4. **Like button not updating**:
   - Check browser console for errors
   - Verify API endpoints are responding
   - Check accommodation object structure

## 🎉 Congratulations!

You now have a complete accommodation likes feature that includes:

- ✅ Secure database schema with RLS
- ✅ RESTful API endpoints with toggle functionality
- ✅ React hooks for state management
- ✅ Beautiful UI components with animations
- ✅ Toast notifications with accommodation names
- ✅ Accommodation favorites page
- ✅ Authentication integration
- ✅ Optimistic updates and error handling
- ✅ Performance optimization with indexes
- ✅ Rich accommodation data support (eco ratings, features, amenities)

Users can now save their favorite eco-friendly accommodations and access them anytime, just like the activities feature!

## 🔗 Related Features

Consider implementing these complementary features:
- Combined favorites page (activities + accommodations)
- Favorite export functionality  
- Recommendation engine based on liked accommodations
- Social sharing of favorite accommodations
- Accommodation comparison from favorites