"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  Loader2,
  X,
  ChevronDown,
  MapPinned,
  Navigation,
} from "lucide-react";
import { useCitySearch } from "@/hooks/useCitySearch";

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
  showRadiusSelector = true, // Show radius selector option
  initialRadius = 5, // Default radius in km
}) {
  const {
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
    setQuery,
    selectCity,
    clearSearch,
    setIsOpen,
    setSearchRadius,
    requestLocation,
    dismissLocationPrompt,
  } = useCitySearch(300, initialRadius);

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
  const handleCitySelect = async (city) => {
    const cityWithCoords = await selectCity(city);
    setSelectedIndex(-1);

    // Callback to parent component with coordinates
    if (onCitySelect) {
      onCitySelect(cityWithCoords);
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
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          handleCitySelect(suggestions[selectedIndex]);
        }
        // Don't prevent default if no suggestion is selected - let parent handle it
        break;
      case "Escape":
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear search
  const handleClear = () => {
    clearSearch();
    setSelectedIndex(-1);
    inputRef.current?.focus();

    if (onInputChange) {
      onInputChange("");
    }
  };

  const displaySuggestions = query.length >= 2 ? suggestions : [];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Location Prompt */}
      {showLocationPrompt && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <Navigation
              size={18}
              className="text-blue-600 mt-0.5 mr-2 flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Enable location for better results
              </p>
              <p className="text-xs text-blue-700 mb-2">
                Get more accurate suggestions for places near you
              </p>
              <div className="flex gap-2">
                <button
                  onClick={requestLocation}
                  className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  type="button"
                >
                  Enable Location
                </button>
                <button
                  onClick={dismissLocationPrompt}
                  className="text-xs px-3 py-1.5 bg-white text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                  type="button"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Radius Selector */}
      {/* {showRadiusSelector && userLocation && (
        <div className="mb-2 flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center">
            <MapPinned size={14} className="text-emerald-600 mr-2" />
            <span className="text-xs text-emerald-800 font-medium">
              Search Radius:
            </span>
          </div>
          <div className="flex gap-1">
            {[10, 25, 50, 100, 200].map((radius) => (
              <button
                key={radius}
                onClick={() => setSearchRadius(radius)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  searchRadius === radius
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-emerald-700 hover:bg-emerald-100"
                }`}
                type="button"
              >
                {radius}km
              </button>
            ))}
          </div>
        </div>
      )} */}

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
          className={
            inputClassName ||
            "w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          }
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {/* Search Icon */}
        <Search
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600"
        />

        {/* Loading / Clear / Dropdown Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
          {loading && (
            <Loader2 size={16} className="animate-spin text-gray-400 mr-1" />
          )}
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
            className={`text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={
            dropdownClassName ||
            "absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
          }
        >
          {error && (
            <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
              <div className="flex items-center">
                <X size={16} className="mr-2 flex-shrink-0" />
                {error}
              </div>
            </div>
          )}

          {displaySuggestions.length === 0 &&
            !loading &&
            !error &&
            query.length >= 2 && (
              <div className="px-4 py-8 text-center">
                <MapPin size={24} className="mx-auto mb-3 text-gray-300" />
                <div className="text-sm text-gray-500 mb-1">
                  No cities found
                </div>
                <div className="text-xs text-gray-400">
                  Try a different search term
                </div>
              </div>
            )}

          {query.length < 2 && !loading && (
            <div className="px-4 py-8 text-center">
              <Search size={24} className="mx-auto mb-3 text-gray-300" />
              <div className="text-sm text-gray-500 mb-1">
                Search for cities
              </div>
              <div className="text-xs text-gray-400">
                Type at least 2 characters to begin
              </div>
            </div>
          )}

          {loading && (
            <div className="px-4 py-8 text-center">
              <Loader2
                size={24}
                className="mx-auto mb-3 text-emerald-500 animate-spin"
              />
              <div className="text-sm text-gray-500">Searching cities...</div>
            </div>
          )}

          {displaySuggestions.map((city, index) => (
            <button
              key={city.id}
              onClick={() => handleCitySelect(city)}
              className={`w-full px-4 py-3 z-50 text-left hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none transition-all duration-150 ${
                selectedIndex === index
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-900"
              } ${
                index === displaySuggestions.length - 1
                  ? ""
                  : "border-b border-gray-100"
              }`}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                  <MapPin size={14} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {city.name}
                  </div>
                  {city.address && (
                    <div className="text-sm text-gray-500 truncate">
                      {city.address}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
