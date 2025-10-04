import { useState, useEffect, useRef, useCallback } from "react";

// Generate unique session token for cost optimization
const generateSessionToken = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function useCitySearch(debounceMs = 300, initialRadius = 50) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [searchRadius, setSearchRadius] = useState(initialRadius); // in km
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const debounceTimer = useRef(null);
  const abortController = useRef(null);
  const sessionToken = useRef(generateSessionToken());

  // Request GPS location from browser
  const requestGPSLocation = useCallback(() => {
    console.log(navigator.geolocation);
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      setShowLocationPrompt(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationPermission("granted");
        setShowLocationPrompt(false);
      },
      (error) => {
        console.log("GPS denied or unavailable:", error.message);
        setLocationPermission("denied");
        setShowLocationPrompt(false);
        setUserLocation(null);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  // Check permission status on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      return;
    }

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          setLocationPermission(result.state);

          if (result.state === "granted") {
            requestGPSLocation();
          } else if (result.state === "prompt") {
            setShowLocationPrompt(true);
          }

          result.addEventListener("change", () => {
            setLocationPermission(result.state);
            if (result.state === "granted") {
              requestGPSLocation();
              setShowLocationPrompt(false);
            }
          });
        })
        .catch(() => {
          setShowLocationPrompt(true);
        });
    } else {
      setShowLocationPrompt(true);
    }
  }, [requestGPSLocation]);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setSuggestions([]);
        setLoading(false);
        setIsOpen(false);
        return;
      }

      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          sessiontoken: sessionToken.current,
        });

        // Add location bias if available
        if (userLocation) {
          params.append("lat", userLocation.lat.toString());
          params.append("lng", userLocation.lng.toString());
          params.append("radius", (searchRadius * 1000).toString());
        }

        const response = await fetch(`/api/cities?${params}`, {
          signal: abortController.current.signal,
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setSuggestions(data.data || []);
          setIsOpen(data.data?.length > 0);
        } else {
          throw new Error(data.error || "Search failed");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("City search error:", err);
          setError(err.message);
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [userLocation, searchRadius]
  );

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      debouncedSearch(query);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debouncedSearch, debounceMs]);

  // Fetch coordinates when city is selected
  const selectCity = useCallback(async (city) => {
    setQuery(city.displayName);
    setIsOpen(false);
    setSuggestions([]);

    if (city.placeId) {
      try {
        const params = new URLSearchParams({
          placeid: city.placeId,
          sessiontoken: sessionToken.current,
        });

        const response = await fetch(`/api/cities/details?${params}`);
        const data = await response.json();

        if (data.success && data.data) {
          console.log("dd", data);
          const cityWithCoords = {
            ...city,
            latitude: data.data.latitude,
            longitude: data.data.longitude,
          };
          setSelectedCity(cityWithCoords);
          sessionToken.current = generateSessionToken();
          return cityWithCoords;
        }
      } catch (err) {
        console.error("Failed to fetch coordinates:", err);
      }
    }

    setSelectedCity(city);
    return city;
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    setError(null);
    setSelectedCity(null);

    if (abortController.current) {
      abortController.current.abort();
    }

    sessionToken.current = generateSessionToken();
  }, []);

  const handleInputChange = useCallback((value) => {
    setQuery(value);
    if (!value || value.trim().length < 2) {
      setIsOpen(false);
      setSuggestions([]);
    }
  }, []);

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

  return {
    query,
    suggestions,
    loading,
    error,
    isOpen,
    selectedCity,
    userLocation,
    locationPermission,
    searchRadius,
    showLocationPrompt,
    setQuery: handleInputChange,
    selectCity,
    clearSearch,
    setIsOpen,
    setSearchRadius,
    requestLocation: requestGPSLocation,
    dismissLocationPrompt: () => setShowLocationPrompt(false),
  };
}
