"use client";

import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Star,
  ExternalLink,
  Clock,
  Leaf,
  Navigation,
} from "lucide-react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  calculateRouteFromUserLocation,
  createMarkerIcon,
} from "@/utils/mapHelpers";

export default function TransportDetailsModal({
  transport,
  onClose,
  getEcoPreference,
  getTransportIcon,
}) {
  const [transportDetails, setTransportDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [routeMode, setRouteMode] = useState("DRIVING");

  const { mapLoaded, initializeMap } = useGoogleMaps();
  const { userLocation, getUserLocation } = useUserLocation();

  useEffect(() => {
    if (transport) {
      // Use existing transport data since we already have all the details
      setTransportDetails(transport);
      setLoading(false);
    }
  }, [transport]);

  useEffect(() => {
    if (
      mapLoaded &&
      transportDetails &&
      getTransportLocation(transportDetails)
    ) {
      initializeTransportMap();
    }
  }, [mapLoaded, transportDetails]);

  const getTransportLocation = (transport) => {
    // Handle different location structures
    if (transport.geometry?.location) {
      return transport.geometry.location;
    }
    if (transport.coordinates) {
      return transport.coordinates;
    }
    if (transport.lat && transport.lng) {
      return { lat: transport.lat, lng: transport.lng };
    }
    return null;
  };

  const initializeTransportMap = () => {
    const mapElement = document.getElementById("transport-detail-map");
    const location = getTransportLocation(transportDetails);
    if (!mapElement || !location) return;

    const center = {
      lat: location.lat,
      lng: location.lng,
    };

    const mapInstance = initializeMap(mapElement, center);
    if (!mapInstance) return;

    // Add transport marker
    const transportIcon = createMarkerIcon("transport", 0);
    const transportMarkerOptions = {
      position: center,
      map: mapInstance.map,
      title: transportDetails.name,
      zIndex: 1000,
    };

    if (transportIcon) {
      transportMarkerOptions.icon = transportIcon;
    }

    const transportMarker = new window.google.maps.Marker(
      transportMarkerOptions
    );

    // Add user location marker if available
    if (userLocation && showRoutes) {
      const userIcon = createMarkerIcon("user");
      const userMarkerOptions = {
        position: userLocation,
        map: mapInstance.map,
        title: "Your Location",
        zIndex: 2000,
      };

      if (userIcon) {
        userMarkerOptions.icon = userIcon;
      }

      const userMarker = new window.google.maps.Marker(userMarkerOptions);

      // Calculate route
      calculateRouteFromUserLocation(
        userLocation,
        center,
        routeMode,
        mapInstance.directionsService,
        mapInstance.directionsRenderer,
        "route-info-modal"
      );

      // Fit bounds to show both markers
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(center);
      bounds.extend(userLocation);
      mapInstance.map.fitBounds(bounds);
    } else {
      // Center on transport
      mapInstance.map.setCenter(center);
      mapInstance.map.setZoom(15);
    }
  };

  const handleGetDirections = async () => {
    if (!userLocation) {
      try {
        await getUserLocation();
      } catch (error) {
        console.error("Failed to get location:", error);
        return;
      }
    }
    setShowRoutes(true);
    // Re-initialize map with routes
    setTimeout(() => initializeTransportMap(), 100);
  };

  if (!transport) return null;

  const ecoPreference = getEcoPreference
    ? getEcoPreference(transport)
    : {
        label: "Eco-Friendly",
        icon: "🌱",
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-800",
        borderColor: "border-emerald-300",
        message: "Environmentally conscious choice",
      };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">
                {transport.icon || getTransportIcon?.(transport.type) || "🚗"}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {loading
                  ? "Loading..."
                  : transportDetails?.name || "Transport Details"}
              </h2>
            </div>
            {transportDetails?.vicinity && (
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin size={16} />
                {transportDetails.vicinity}
              </p>
            )}
            {/* Eco Preference Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-2 ${ecoPreference.bgColor} ${ecoPreference.textColor}`}
            >
              <span>{ecoPreference.icon}</span>
              <span>{ecoPreference.label}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-scroll">
          {/* Left Panel - Details */}
          <div className="lg:w-1/2 p-6 overflow-y-auto flex-shrink-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <p className="text-gray-600">Showing basic information</p>
              </div>
            ) : null}

            {transportDetails && (
              <div className="space-y-6">
                {/* Image */}
                {((transportDetails.photos &&
                  transportDetails.photos.length > 0) ||
                  transportDetails.image) && (
                  <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={
                        transportDetails.photos?.[0]?.url ||
                        transportDetails.image
                      }
                      alt={transportDetails.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  {transportDetails.rating &&
                    transportDetails.rating !== "N/A" && (
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-yellow-400" />
                        <span className="font-medium">
                          {transportDetails.rating}/5
                        </span>
                      </div>
                    )}
                  {transportDetails.openNow !== undefined && (
                    <div className="flex items-center gap-2">
                      <Clock
                        size={16}
                        className={
                          transportDetails.openNow
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      />
                      <span
                        className={
                          transportDetails.openNow
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {transportDetails.openNow ? "Open Now" : "Closed"}
                      </span>
                    </div>
                  )}
                  {(transportDetails.ecoScore ||
                    transportDetails.carbonRating) && (
                    <div className="flex items-center gap-2">
                      <Leaf size={16} className="text-green-500" />
                      <span>
                        Eco Score:{" "}
                        {transportDetails.ecoScore ||
                          transportDetails.carbonRating ||
                          3}
                        /5
                      </span>
                    </div>
                  )}
                  {transportDetails.carbonFactor !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🌱</span>
                      <span>
                        {transportDetails.carbonFactor === 0
                          ? "Zero emissions!"
                          : `${transportDetails.carbonFactor}kg CO₂/km`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {transportDetails.description ||
                      "A reliable transportation option for your eco-friendly journey."}
                  </p>
                </div>

                {/* Transport Type */}
                {transportDetails.type && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Transport Type
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {transportDetails.type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                )}

                {/* Eco Features */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Environmental Impact
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      {ecoPreference.message}
                    </span>
                    {transportDetails.carbonFactor === 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Zero Emissions
                      </span>
                    )}
                    {transportDetails.ecoScore >= 4 && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        Highly Eco-Friendly
                      </span>
                    )}
                  </div>
                </div>

                {/* External Links */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const searchQuery = transportDetails.placeId
                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            transportDetails.name +
                              " " +
                              (transportDetails.vicinity || "")
                          )}&query_place_id=${transportDetails.placeId}`
                        : `https://www.google.com/search?q=${encodeURIComponent(
                            transportDetails.name +
                              " " +
                              (transportDetails.vicinity || "")
                          )}`;
                      window.open(searchQuery, "_blank");
                    }}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Search Online
                  </button>
                  <button
                    onClick={() => {
                      const mapsQuery = transportDetails.placeId
                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            transportDetails.name +
                              " " +
                              (transportDetails.vicinity || "")
                          )}&query_place_id=${transportDetails.placeId}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            transportDetails.name +
                              " " +
                              (transportDetails.vicinity || "")
                          )}`;
                      window.open(mapsQuery, "_blank");
                    }}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink size={16} />
                    View on Google Maps
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 mb-4">
                Location & Directions
              </h3>

              {/* Route Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={handleGetDirections}
                    disabled={showRoutes && userLocation}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showRoutes && userLocation
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
                    }`}
                  >
                    {showRoutes && userLocation ? (
                      <>
                        <Navigation size={16} className="inline mr-2" />
                        Directions Shown
                      </>
                    ) : (
                      <>
                        <Navigation size={16} className="inline mr-2" />
                        Get Directions
                      </>
                    )}
                  </button>

                  {showRoutes && (
                    <select
                      value={routeMode}
                      onChange={(e) => {
                        setRouteMode(e.target.value);
                        setTimeout(() => initializeTransportMap(), 100);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="WALKING">🚶 Walking</option>
                      <option value="DRIVING">🚗 Driving</option>
                      <option value="TRANSIT">🚌 Transit</option>
                    </select>
                  )}
                </div>

                {/* Route Info */}
                <div id="route-info-modal" className="text-sm">
                  {/* Route information will be populated here */}
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative min-h-[300px] lg:min-h-0">
              <div
                id="transport-detail-map"
                className="absolute inset-0 w-full h-full"
              >
                {!mapLoaded && (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mx-auto mb-2"></div>
                      <div className="text-gray-500">Loading map...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
