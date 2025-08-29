import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAccommodationLikes() {
  const [likedAccommodations, setLikedAccommodations] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const supabase = createClient();

  // Initialize user and load likes
  useEffect(() => {
    const initializeUser = async () => {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (currentUser && !error) {
        setUser(currentUser);
        await loadUserAccommodationLikes();
      } else {
        setUser(null);
        setLikedAccommodations(new Set());
      }
    };

    initializeUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadUserAccommodationLikes();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLikedAccommodations(new Set());
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load all user's liked accommodations
  const loadUserAccommodationLikes = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/accommodation-likes');
      const data = await response.json();

      if (data.success) {
        const likedIds = new Set(data.data.map(like => like.accommodation_id));
        setLikedAccommodations(likedIds);
      }
    } catch (error) {
      console.error('Error loading accommodation likes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if specific accommodation is liked
  const isAccommodationLiked = useCallback((accommodationId) => {
    return likedAccommodations.has(accommodationId);
  }, [likedAccommodations]);

  // Toggle like status for an accommodation
  const toggleAccommodationLike = useCallback(async (accommodation) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    const { id: accommodationId } = accommodation;
    const wasLiked = likedAccommodations.has(accommodationId);
    
    console.log(`[TOGGLE ACCOMMODATION LIKE] Accommodation: ${accommodationId}, Was liked: ${wasLiked}`);

    // Optimistic update
    setLikedAccommodations(prev => {
      const newSet = new Set(prev);
      if (wasLiked) {
        newSet.delete(accommodationId);
      } else {
        newSet.add(accommodationId);
      }
      return newSet;
    });

    try {
      // Always use POST - the API handles toggling automatically
      const response = await fetch('/api/accommodation-likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accommodationId: accommodation.id,
          accommodationName: accommodation.name,
          accommodationLocation: accommodation.location,
          accommodationImageUrl: accommodation.image,
          accommodationPrice: accommodation.price,
          accommodationRating: accommodation.rating,
          accommodationEcoRating: accommodation.ecoRating,
          accommodationDescription: accommodation.description,
          accommodationChainCode: accommodation.chainCode,
          accommodationFeatures: accommodation.features,
          accommodationAmenities: accommodation.amenities,
          accommodationCoordinates: accommodation.coordinates,
          accommodationSource: accommodation.source || 'amadeus'
        }),
      });
      
      const data = await response.json();
      
      console.log(`[TOGGLE ACCOMMODATION LIKE] API Response:`, {
        success: data.success,
        action: data.action,
        isLiked: data.isLiked,
        message: data.message,
        accommodationName: accommodation.name
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to toggle accommodation like');
      }
      
      // Update local state with actual result
      setLikedAccommodations(prev => {
        const newSet = new Set(prev);
        if (data.isLiked) {
          newSet.add(accommodationId);
        } else {
          newSet.delete(accommodationId);
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
      setLikedAccommodations(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(accommodationId);
        } else {
          newSet.delete(accommodationId);
        }
        return newSet;
      });
      
      throw error;
    }
  }, [user, likedAccommodations]);

  // Get all liked accommodations with full details
  const getLikedAccommodations = useCallback(async (page = 1, limit = 10) => {
    if (!user) return { data: [], pagination: null };

    try {
      setLoading(true);
      const response = await fetch(`/api/accommodation-likes?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        return {
          data: data.data,
          pagination: data.pagination
        };
      } else {
        throw new Error(data.error || 'Failed to fetch liked accommodations');
      }
    } catch (error) {
      console.error('Error fetching liked accommodations:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get accommodation likes count
  const getAccommodationLikesCount = useCallback(() => {
    return likedAccommodations.size;
  }, [likedAccommodations]);

  // Check auth status
  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  return {
    // State
    user,
    loading,
    likedAccommodations: Array.from(likedAccommodations),
    
    // Actions
    toggleAccommodationLike,
    isAccommodationLiked,
    loadUserAccommodationLikes,
    getLikedAccommodations,
    
    // Getters
    getAccommodationLikesCount,
    isAuthenticated,
  };
}

// Lightweight hook for just checking accommodation like status (useful for performance)
export function useAccommodationLikeStatus(accommodationId) {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const checkAccommodationLikeStatus = async () => {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
      if (!currentUser || error || !accommodationId) {
        setIsLiked(false);
        setUser(currentUser);
        return;
      }

      setUser(currentUser);
      setLoading(true);

      try {
        const response = await fetch(`/api/accommodation-likes?accommodationId=${encodeURIComponent(accommodationId)}`);
        const data = await response.json();

        if (data.success) {
          setIsLiked(data.isLiked);
        }
      } catch (error) {
        console.error('Error checking accommodation like status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAccommodationLikeStatus();
  }, [accommodationId, supabase]);

  return {
    isLiked,
    loading,
    isAuthenticated: !!user,
    setIsLiked // For optimistic updates
  };
}