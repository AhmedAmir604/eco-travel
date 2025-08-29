import { useState, useEffect, useRef, useCallback } from 'react';

export function useCitySearch(debounceMs = 300) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState(null);
  
  const debounceTimer = useRef(null);
  const abortController = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    // Cancel previous request if still pending
    if (abortController.current) {
      abortController.current.abort();
    }

    // Create new abort controller for this request
    abortController.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/cities?q=${encodeURIComponent(searchQuery)}`,
        { 
          signal: abortController.current.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.data || []);
        setIsOpen(data.data?.length > 0);
        
        // Handle fallback information
        setIsFallback(data.fallback || false);
        setFallbackReason(data.reason || null);
        
        // Only show error if it's a true error, not just fallback info
        if (data.fallback && data.message && !data.reason?.includes('no_key')) {
          console.info('City search fallback:', data.message);
        }
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('City search error:', err);
        setError(err.message);
        setSuggestions([]);
        setIsOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to handle debounced search
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      debouncedSearch(query);
    }, debounceMs);

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debouncedSearch, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const selectCity = useCallback((city) => {
    setQuery(city.displayName);
    setIsOpen(false);
    setSuggestions([]);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setError(null);
    setIsFallback(false);
    setFallbackReason(null);
    
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  const handleInputChange = useCallback((value) => {
    setQuery(value);
    if (!value || value.trim().length < 2) {
      setIsOpen(false);
      setSuggestions([]);
      setIsFallback(false);
      setFallbackReason(null);
    }
  }, []);

  return {
    query,
    suggestions,
    loading,
    error,
    isOpen,
    isFallback,
    fallbackReason,
    setQuery: handleInputChange,
    selectCity,
    clearSearch,
    setIsOpen
  };
}