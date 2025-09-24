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
  inputClassName = "",
  dropdownClassName = "",
  countryCode = null // Optional country filter (ISO 3166 Alpha-2 code)
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
  } = useCitySearch(300, countryCode);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);



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

  const displaySuggestions = query.length >= 2 ? suggestions : [];

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
        <div className={dropdownClassName || "absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"}>
          {error && (
            <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
              <div className="flex items-center">
                <X size={16} className="mr-2 flex-shrink-0" />
                {error}
              </div>
            </div>
          )}

          {isFallback && fallbackReason && (
            <div className="px-4 py-3 text-xs bg-amber-50 text-amber-800 border-b border-amber-100">
              <div className="flex items-center">
                {fallbackReason === 'rate_limited' && (
                  <>
                    <span className="mr-2">⚠️</span>
                    API rate limit reached - showing limited results
                  </>
                )}
                {fallbackReason === 'no_key' && (
                  <>
                    <span className="mr-2">ℹ️</span>
                    Demo mode - limited city suggestions available
                  </>
                )}
                {fallbackReason === 'api_unavailable' && (
                  <>
                    <span className="mr-2">⚡</span>
                    Offline mode - showing cached results
                  </>
                )}
              </div>
            </div>
          )}

          {displaySuggestions.length === 0 && !loading && !error && query.length >= 2 && (
            <div className="px-4 py-8 text-center">
              <MapPin size={24} className="mx-auto mb-3 text-gray-300" />
              <div className="text-sm text-gray-500 mb-1">No cities found</div>
              <div className="text-xs text-gray-400">Try a different search term</div>
            </div>
          )}

          {query.length < 2 && !loading && (
            <div className="px-4 py-8 text-center">
              <Search size={24} className="mx-auto mb-3 text-gray-300" />
              <div className="text-sm text-gray-500 mb-1">Search for cities</div>
              <div className="text-xs text-gray-400">Type at least 2 characters to begin</div>
            </div>
          )}

          {loading && (
            <div className="px-4 py-8 text-center">
              <Loader2 size={24} className="mx-auto mb-3 text-emerald-500 animate-spin" />
              <div className="text-sm text-gray-500">Searching cities...</div>
            </div>
          )}

          {displaySuggestions.map((city, index) => (
            <button
              key={city.id}
              onClick={() => handleCitySelect(city)}
              className={`w-full px-4 py-3 text-left hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none transition-all duration-150 ${selectedIndex === index ? 'bg-emerald-50 text-emerald-700' : 'text-gray-900'
                } ${index === displaySuggestions.length - 1 ? '' : 'border-b border-gray-100'}`}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                  <MapPin size={14} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{city.name}</div>
                  <div className="text-sm text-gray-500 truncate">{city.country}</div>
                </div>
                {city.iataCode && (
                  <div className="flex-shrink-0 ml-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                      {city.iataCode}
                    </span>
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