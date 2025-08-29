'use client'

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, X, ChevronDown } from 'lucide-react';
import { useCitySearch } from '@/hooks/useCitySearch';

export default function CitySearchInput({
  placeholder = "Search for a city...",
  onCitySelect,
  onInputChange,
  onKeyDown,
  initialValue = "",
  className = "",
  disabled = false,
  showPopularCities = true,
  inputClassName = "",
  dropdownClassName = ""
}) {
  const {
    query,
    suggestions,
    loading,
    error,
    isOpen,
    isFallback,
    fallbackReason,
    setQuery,
    selectCity,
    clearSearch,
    setIsOpen
  } = useCitySearch(300);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Popular cities for quick selection
  const popularCities = [
    { id: 'popular-1', name: 'London', displayName: 'London, England, United Kingdom', country: 'United Kingdom' },
    { id: 'popular-2', name: 'Paris', displayName: 'Paris, Île-de-France, France', country: 'France' },
    { id: 'popular-3', name: 'New York', displayName: 'New York, New York, United States', country: 'United States' },
    { id: 'popular-4', name: 'Tokyo', displayName: 'Tokyo, Tokyo, Japan', country: 'Japan' },
    { id: 'popular-5', name: 'Dubai', displayName: 'Dubai, Dubai, United Arab Emirates', country: 'United Arab Emirates' },
    { id: 'popular-6', name: 'Singapore', displayName: 'Singapore, Singapore', country: 'Singapore' }
  ];

  // Initialize with provided value
  useEffect(() => {
    if (initialValue && initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Handle city selection
  const handleCitySelect = (city) => {
    selectCity(city);
    setSelectedIndex(-1);
    
    // Callback to parent component
    if (onCitySelect) {
      onCitySelect(city);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    // Callback to parent component
    if (onInputChange) {
      onInputChange(value);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // Call parent's keyDown handler first
    if (onKeyDown) {
      onKeyDown(e);
    }

    // Only handle internal navigation if dropdown is open
    if (!isOpen) return;

    const itemCount = suggestions.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < itemCount - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          handleCitySelect(suggestions[selectedIndex]);
        }
        // Don't prevent default if no suggestion is selected - let parent handle it
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (query.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    } else if (showPopularCities && query.length < 2) {
      setIsOpen(true);
    }
  };

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const handleClear = () => {
    clearSearch();
    setSelectedIndex(-1);
    inputRef.current?.focus();
    
    if (onInputChange) {
      onInputChange('');
    }
  };

  const displaySuggestions = query.length >= 2 ? suggestions : (showPopularCities ? popularCities : []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClassName || "w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        
        {/* Search Icon */}
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600" />
        
        {/* Loading / Clear / Dropdown Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
          {loading && <Loader2 size={16} className="animate-spin text-gray-400 mr-1" />}
          {query && !loading && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 mr-1"
              type="button"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={dropdownClassName || "absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"}>
          {error && (
            <div className="px-4 py-2 text-sm text-red-600 bg-red-50">
              {error}
            </div>
          )}
          
          {isFallback && fallbackReason && (
            <div className="px-3 py-2 text-xs bg-emerald-50 text-emerald-700 border-b border-emerald-100">
              {fallbackReason === 'rate_limited' && '⚠️ API limit reached - showing popular cities'}
              {fallbackReason === 'no_key' && 'ℹ️ Using demo mode - limited city suggestions'}
              {fallbackReason === 'api_unavailable' && '⚡ Offline mode - showing popular cities'}
            </div>
          )}
          
          {displaySuggestions.length === 0 && !loading && !error && (
            <div className="px-4 py-2 text-sm text-gray-500">
              {query.length < 2 ? "Type at least 2 characters to search" : "No cities found"}
            </div>
          )}

          {query.length < 2 && showPopularCities && (
            <div className="px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border-b">
              Popular Destinations
            </div>
          )}

          {displaySuggestions.map((city, index) => (
            <button
              key={city.id}
              onClick={() => handleCitySelect(city)}
              className={`w-full px-4 py-2 text-left hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none transition-colors ${
                selectedIndex === index ? 'bg-emerald-50 text-emerald-700' : 'text-gray-900'
              }`}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <div className="flex items-center">
                <MapPin size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{city.name}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {city.region && city.country 
                      ? `${city.region}, ${city.country}`
                      : city.country || city.displayName
                    }
                  </div>
                </div>
                {city.population && (
                  <div className="text-xs text-gray-400 ml-2">
                    {(city.population / 1000000).toFixed(1)}M
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}