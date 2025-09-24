import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useLikes() {
  const [likedActivities, setLikedActivities] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const supabase = createClient();

  // Initialize user and load likes
  useEffect(() => {
    const initializeUser = async () => {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (currentUser && !error) {
        setUser(currentUser);
        await loadUserLikes();
      } else {
        setUser(null);
        setLikedActivities(new Set());
      }
    };

    initializeUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadUserLikes();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLikedActivities(new Set());
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load all user's liked activities
  const loadUserLikes = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/likes');
      const data = await response.json();

      if (data.success) {
        const likedIds = new Set(data.data.map(like => like.activity_id));
        setLikedActivities(likedIds);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if specific activity is liked
  const isLiked = useCallback((activityId) => {
    return likedActivities.has(activityId);
  }, [likedActivities]);

  // Toggle like status for an activity
  const toggleLike = useCallback(async (activity) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    const { id: activityId } = activity;
    const wasLiked = likedActivities.has(activityId);
    
    //(`[TOGGLE LIKE] Activity: ${activityId}, Was liked: ${wasLiked}`);

    // Optimistic update
    setLikedActivities(prev => {
      const newSet = new Set(prev);
      if (wasLiked) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });

    try {
      // Always use POST - the API handles toggling automatically
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: activity.id,
          activityName: activity.name,
          activityLocation: activity.location,
          activityImageUrl: activity.image,
          activityPrice: activity.price,
          activityRating: activity.rating,
          activityDescription: activity.description,
          activitySource: activity.isRealData ? 'amadeus' : 'fallback'
        }),
      });
      
      const data = await response.json();
    
      if (!data.success) {
        throw new Error(data.error || 'Failed to toggle like');
      }
      
      // Update local state with actual result
      setLikedActivities(prev => {
        const newSet = new Set(prev);
        if (data.isLiked) {
          newSet.add(activityId);
        } else {
          newSet.delete(activityId);
        }
        return newSet;
      });
      
      return {
        success: true,
        action: data.action,
        isLiked: data.isLiked
      };
    } catch (error) {
      // Revert optimistic update on error
      setLikedActivities(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(activityId);
        } else {
          newSet.delete(activityId);
        }
        return newSet;
      });
      
      throw error;
    }
  }, [user, likedActivities]);

  // Get all liked activities with full details
  const getLikedActivities = useCallback(async (page = 1, limit = 10) => {
    if (!user) return { data: [], pagination: null };

    try {
      setLoading(true);
      const response = await fetch(`/api/likes?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        return {
          data: data.data,
          pagination: data.pagination
        };
      } else {
        throw new Error(data.error || 'Failed to fetch liked activities');
      }
    } catch (error) {
      console.error('Error fetching liked activities:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get likes count
  const getLikesCount = useCallback(() => {
    return likedActivities.size;
  }, [likedActivities]);

  // Check auth status
  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  return {
    // State
    user,
    loading,
    likedActivities: Array.from(likedActivities),
    
    // Actions
    toggleLike,
    isLiked,
    loadUserLikes,
    getLikedActivities,
    
    // Getters
    getLikesCount,
    isAuthenticated,
  };
}

// Lightweight hook for just checking like status (useful for performance)
export function useLikeStatus(activityId) {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const checkLikeStatus = async () => {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
      if (!currentUser || error || !activityId) {
        setIsLiked(false);
        setUser(currentUser);
        return;
      }

      setUser(currentUser);
      setLoading(true);

      try {
        const response = await fetch(`/api/likes?activityId=${encodeURIComponent(activityId)}`);
        const data = await response.json();

        if (data.success) {
          setIsLiked(data.isLiked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLikeStatus();
  }, [activityId, supabase]);

  return {
    isLiked,
    loading,
    isAuthenticated: !!user,
    setIsLiked // For optimistic updates
  };
}