"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import CitySearchInput from "@/components/CitySearchInput";
import Pagination from "@/components/Pagination";
import AccommodationTabs from "@/components/accommodations/AccommodationTabs";
import AccommodationList from "@/components/accommodations/AccommodationList";
import AccommodationMap from "@/components/accommodations/AccommodationMap";

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchRadius, setSearchRadius] = useState("25");
  const [error, setError] = useState();
  const [searchInfo, setSearchInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(4);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const { toast } = useToast();

  const searchAccommodations = async (city, radius = searchRadius) => {
    if (!city.trim()) return;

    setLoading(true);
    setError("");
    setCurrentPage(1); // Reset to first page on new search

    try {
      const response = await fetch(
        `/api/accommodations?city=${encodeURIComponent(city)}&radius=${radius}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch accommodations");
      }

      setAccommodations(result.data);
      setSearchInfo({
        city: result.city,
        checkIn: result.checkIn,
        checkOut: result.checkOut,
        count: result.data.length,
        radius: radius,
      });

      // Show success toast
      if (result.data.length > 0) {
        toast.success(
          `Found ${result.data.length} eco-friendly accommodations in ${result.city}`
        );
      } else {
        toast.warning(
          `No accommodations found in ${city}. Try expanding your search radius.`
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to search accommodations");
      setError(err.message);
      setAccommodations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchAccommodations(searchCity, searchRadius);
  };

  const handleAccommodationSelect = (accommodation) => {
    setSelectedAccommodation(accommodation);
    // Switch to map view if not already there
    if (activeTab !== "map") {
      setActiveTab("map");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(accommodations.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentAccommodations = accommodations.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setPaginationLoading(true);
    setCurrentPage(page);
    // Scroll to top of results
    window.scrollTo({ top: 400, behavior: "smooth" });
    // Remove loading state after scroll animation
    setTimeout(() => setPaginationLoading(false), 300);
  };

  // Load default results for popular eco destinations
  useEffect(() => {
    searchAccommodations("Paris");
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">
            Eco-Friendly Accommodations
          </h1>
          <p className="text-gray-600 mb-6">
            Discover sustainable places to stay that minimize environmental
            impact while providing comfortable and memorable experiences. Search
            by city name to find eco-friendly hotels with precise Google Maps
            integration.
          </p>

          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4 items-center"
          >
            <div className="flex-1">
              <CitySearchInput
                placeholder="Search for a city (e.g., Paris, London) - Press Enter to search or select from suggestions"
                initialValue={searchCity}
                onCitySelect={(city) => {
                  const cityName =
                    city.name || city.displayName?.split(",")[0] || "";
                  setSearchCity(cityName);
                  // Auto-search when city is selected
                  if (cityName) {
                    searchAccommodations(cityName, searchRadius);
                  }
                }}
                onInputChange={(value) => {
                  setSearchCity(value);
                }}
                onKeyDown={(e) => {
                  // Allow manual search when Enter is pressed
                  if (
                    e.key === "Enter" &&
                    searchCity &&
                    searchCity.length >= 2
                  ) {
                    e.preventDefault();
                    searchAccommodations(searchCity, searchRadius);
                  }
                }}
                disabled={loading}
                className="w-full"
              />
            </div>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="5">5 km radius</option>
              <option value="10">10 km radius</option>
              <option value="25">25 km radius</option>
              <option value="50">50 km radius</option>
              <option value="100">100 km radius</option>
            </select>
            <button
              type="submit"
              disabled={loading || !searchCity.trim()}
              className="px-6 py-2 max-h-[3rem] bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Search size={18} className="mr-2" />
              )}
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {searchInfo && (
            <div className="mt-4 p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-700">
                Found <strong>{searchInfo.count}</strong> eco-friendly
                accommodations in <strong>{searchInfo.city}</strong>
                <span className="text-gray-600">
                  {" "}
                  (within {searchInfo.radius} km radius)
                </span>
                {searchInfo.checkIn && (
                  <span>
                    {" "}
                    for {new Date(
                      searchInfo.checkIn
                    ).toLocaleDateString()} -{" "}
                    {new Date(searchInfo.checkOut).toLocaleDateString()}
                  </span>
                )}
                {searchInfo.count > resultsPerPage && (
                  <span className="block mt-1 text-xs text-gray-600">
                    Showing {resultsPerPage} results per page
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <AccommodationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">
              Finding eco-friendly accommodations...
            </span>
          </div>
        ) : accommodations.length === 0 && !error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Enter a city or country name to search for eco-friendly
              accommodations.
            </p>
          </div>
        ) : (
          <>
            {/* List View */}
            {activeTab === "list" && (
              <>
                <AccommodationList
                  accommodations={currentAccommodations}
                  selectedAccommodation={selectedAccommodation}
                  onAccommodationSelect={handleAccommodationSelect}
                  paginationLoading={paginationLoading}
                />

                {/* Pagination for List View */}
                {accommodations.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={accommodations.length}
                    itemsPerPage={resultsPerPage}
                    onPageChange={handlePageChange}
                    className="mt-8"
                  />
                )}
              </>
            )}

            {/* Map View */}
            {activeTab === "map" && (
              <AccommodationMap
                accommodations={accommodations}
                selectedAccommodation={selectedAccommodation}
                onAccommodationSelect={setSelectedAccommodation}
              />
            )}
          </>
        )}
      </div>

      {/* Toast Container is now global in layout */}
    </main>
  );
}
