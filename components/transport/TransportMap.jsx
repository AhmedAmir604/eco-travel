"use client";

import { useEffect, useState } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  calculateRouteFromUserLocation,
  createMarkerIcon,
  getMapCenter,
} from "@/utils/mapHelpers";
import MapControls from "@/components/itinerary/MapControls";

export default function TransportMap({
  transportOptions,
  selectedTransport,
  onTransportSelect,
}) {
  const [showUserLocationRoutes, setShowUserLocationRoutes] = useState(false);
  const [routeMode, setRouteMode] = useState("WALKING");

  const {
    mapLoaded,
    map,
    markers,
    setMarkers,
    directionsService,
    directionsRenderer,
    clearMapMarkers,
    initializeMap,
  } = useGoogleMaps();
  const {
    userLocation,
    locationPermission,
    isGettingLocation,
    getUserLocation,
  } = useUserLocation();

  // Helper function to format transport type
  const formatTransportType = (transport) => {
    return (
      transport.typeName ||
      (transport.transportType
        ? transport.transportType
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())
        : "Transport")
    );
  };

  // Helper function to get carbon emission info
  const getCarbonEmissionInfo = (transport) => {
    const factor = transport.carbonFactor || transport.carbonEmission || 0;
    const isZeroEmissions = factor === 0;

    let message = "";
    if (factor < 0.05) message = "Ultra-low emissions - Excellent choice!";
    else if (factor < 0.1)
      message = "Low emissions - Great for sustainable travel!";
    else if (factor < 0.2)
      message = "Moderate emissions - Good shared transport!";
    else message = "Consider combining with other eco-friendly options";

    return { factor, isZeroEmissions, message };
  };

  // Helper function to get location display text
  const getLocationText = (transport) => {
    return transport.vicinity || transport.location || "Location available";
  };

  useEffect(() => {
    if (mapLoaded && transportOptions.length > 0) {
      initializeTransportMap();
    }
  }, [mapLoaded, transportOptions]);

  useEffect(() => {
    if (map && transportOptions.length > 0) {
      displayTransportOptionsOnMap();
    }
  }, [
    map,
    transportOptions,
    userLocation,
    showUserLocationRoutes,
    selectedTransport,
  ]);

  const initializeTransportMap = () => {
    const mapElement = document.getElementById("transport-map");
    if (!mapElement) return;

    // Get center from first transport option or default
    const mapCenter =
      transportOptions.length > 0 && transportOptions[0].places?.[0]?.location
        ? {
            lat: transportOptions[0].places[0].location.lat,
            lng: transportOptions[0].places[0].location.lng,
          }
        : { lat: 48.8566, lng: 2.3522 }; // Paris default

    const mapInstance = initializeMap(mapElement, mapCenter);

    if (mapInstance) {
      displayTransportOptionsOnMap(
        mapInstance.map,
        mapInstance.directionsService,
        mapInstance.directionsRenderer
      );
    }
  };

  const displayTransportOptionsOnMap = (
    mapInstance = map,
    directionsServiceInstance = directionsService,
    directionsRendererInstance = directionsRenderer
  ) => {
    if (!mapInstance || transportOptions.length === 0) return;

    clearMapMarkers();
    const newMarkers = [];

    // Add user location marker if available
    if (userLocation) {
      try {
        const icon = createMarkerIcon("user");
        const markerOptions = {
          position: userLocation,
          map: mapInstance,
          title: "Your Location",
          zIndex: 2000,
        };

        if (icon) {
          markerOptions.icon = icon;
        }

        const userMarker = new window.google.maps.Marker(markerOptions);

        const userInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">📍 Your Current Location</h3>
              <p class="text-sm text-gray-600">Click on any transport option to get directions</p>
            </div>
          `,
        });

        userMarker.addListener("click", () => {
          userInfoWindow.open(mapInstance, userMarker);
        });

        newMarkers.push(userMarker);
      } catch (error) {
        console.error("Error adding user location marker:", error);
      }
    }

    // Add transport option markers
    transportOptions.forEach((transportType) => {
      const places = transportType.places || [transportType];

      places.forEach((place) => {
        const location = place.location || place.coordinates;
        if (!location) return;

        const position = {
          lat: location.lat || location.latitude,
          lng: location.lng || location.longitude,
        };

        const transport = transportType.places
          ? {
              ...place,
              type: transportType.type,
              ecoScore: transportType.ecoScore,
              icon: transportType.icon,
            }
          : place;

        const isSelected = isTransportSelected(selectedTransport, place);
        const ecoScore = transport.ecoScore || transport.carbonRating || 3;

        const marker = createTransportMarker({
          position,
          map: mapInstance,
          place,
          transport,
          transportType,
          isSelected,
          ecoScore,
          onMarkerClick: (transportSelection) => {
            onTransportSelect?.(transportSelection);
            if (userLocation) {
              calculateRouteFromUserLocation(
                userLocation,
                position,
                routeMode,
                directionsServiceInstance,
                directionsRendererInstance,
                "route-info"
              );
            }
          },
        });

        newMarkers.push(marker);
      });
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach((marker) => {
        bounds.extend(marker.getPosition());
      });

      if (userLocation) {
        bounds.extend(
          new window.google.maps.LatLng(userLocation.lat, userLocation.lng)
        );
      }

      mapInstance.fitBounds(bounds);

      const listener = window.google.maps.event.addListener(
        mapInstance,
        "idle",
        () => {
          if (mapInstance.getZoom() > 15) mapInstance.setZoom(15);
          if (mapInstance.getZoom() < 8) mapInstance.setZoom(8);
          window.google.maps.event.removeListener(listener);
        }
      );
    }
  };

  // Helper function to check if transport is selected
  const isTransportSelected = (selectedTransport, place) => {
    if (!selectedTransport) return false;
    return (
      (selectedTransport.placeId &&
        selectedTransport.placeId === place.placeId) ||
      (selectedTransport.id && selectedTransport.id === place.id) ||
      (selectedTransport.name === place.name &&
        selectedTransport.vicinity === place.vicinity)
    );
  };

  // Helper function to create transport marker
  const createTransportMarker = ({
    position,
    map,
    place,
    transport,
    transportType,
    isSelected,
    ecoScore,
    onMarkerClick,
  }) => {
    const marker = new window.google.maps.Marker({
      position,
      map,
      title: place.name,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="16" fill="${
              isSelected ? "#dc2626" : getTransportColor(ecoScore)
            }" stroke="white" stroke-width="3"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-size="14">${
              transport.icon || transportType.icon || "🚗"
            }</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
      },
      zIndex: isSelected ? 1500 : 1000 + ecoScore * 100,
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: createTransportInfoWindow(
        place,
        ecoScore,
        transport.icon || transportType.icon || "🚗",
        transportType.name || transport.type,
        transport.carbonFactor || transport.carbonEmission,
        transportType.description || transport.description,
        userLocation
      ),
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);

      const transportSelection = {
        ...place,
        transportType: transport.type || transportType.type,
        ecoScore: ecoScore,
        icon: transport.icon || transportType.icon,
        carbonFactor: transport.carbonFactor || transport.carbonEmission,
        description: transportType.description || transport.description,
        typeName: transportType.name || transport.type,
        location: { lat: position.lat, lng: position.lng },
      };

      onMarkerClick(transportSelection);
    });

    return marker;
  };

  const getTransportColor = (ecoScore) => {
    if (ecoScore >= 5) return "#059669"; // emerald-600
    if (ecoScore >= 4) return "#10b981"; // emerald-500
    if (ecoScore >= 3) return "#22d3ee"; // cyan-400
    if (ecoScore >= 2) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  const getEcoScoreText = (ecoScore) => {
    if (ecoScore >= 5) return "Excellent";
    if (ecoScore >= 4) return "Very Good";
    if (ecoScore >= 3) return "Good";
    if (ecoScore >= 2) return "Fair";
    return "Limited";
  };

  const createTransportInfoWindow = (
    place,
    ecoScore,
    icon,
    typeName,
    carbonFactor,
    description,
    userLocation
  ) => {
    const ecoScoreText = getEcoScoreText(ecoScore);

    return `
      <div class="p-3 max-w-sm">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">${ecoScore}/5 Eco</span>
          ${
            place.rating && place.rating !== "N/A"
              ? `<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">★ ${place.rating}/5</span>`
              : ""
          }
          <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">${
            typeName || "Transport"
          }</span>
        </div>
        
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl">${icon}</span>
          <h3 class="font-bold text-lg">${place.name}</h3>
        </div>
        
        ${
          place.photos && place.photos.length > 0
            ? `<img src="${place.photos[0].url}" alt="${place.name}" class="w-full h-24 object-cover rounded mb-2" onerror="this.style.display='none'">`
            : ""
        }
        
        <div class="mb-3 p-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded border border-emerald-200">
          <div class="text-sm font-medium text-emerald-800 mb-1">🌱 Eco Rating: ${ecoScoreText}</div>
          <div class="text-xs text-emerald-700">${
            description || "Sustainable transport option"
          }</div>
        </div>
        
        <p class="text-xs text-gray-500 mb-2">📍 ${place.vicinity}</p>
        
        ${
          place.openNow !== undefined
            ? `
          <div class="text-xs mb-2">
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              place.openNow
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }">
              ${place.openNow ? "🟢 Open Now" : "🔴 Closed"}
            </span>
          </div>
        `
            : ""
        }
        
        ${
          place.userRatingsTotal && place.userRatingsTotal > 0
            ? `
          <div class="text-xs text-gray-600 mb-2">
            👥 ${place.userRatingsTotal} user reviews
          </div>
        `
            : ""
        }
        
        ${
          carbonFactor !== undefined
            ? `
          <div class="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
            <div class="text-xs text-blue-700 font-medium">🌍 Environmental Impact</div>
            <div class="text-xs text-blue-600">${
              carbonFactor === 0
                ? "Zero emissions! Perfect eco choice 🌱"
                : `${carbonFactor} kg CO₂/km - ${
                    carbonFactor < 0.05
                      ? "Ultra-low impact"
                      : carbonFactor < 0.1
                      ? "Low impact"
                      : carbonFactor < 0.2
                      ? "Moderate impact"
                      : "Higher impact"
                  }`
            }</div>
          </div>
        `
            : ""
        }
        
        ${
          userLocation
            ? `
          <div class="mt-3 p-2 bg-green-50 rounded border border-green-200">
            <div class="text-xs text-green-700 font-medium mb-1">🗺️ Get Directions</div>
            <div class="text-xs text-green-600">Click this marker to calculate route from your location</div>
          </div>
        `
            : ""
        }
        
        <div class="mt-3 pt-2 border-t border-gray-200">
          <div class="flex gap-1">
            <button 
              onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(
                place.name + " " + place.vicinity + " transport info"
              )}', '_blank')"
              class="flex-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors"
            >
              Info
            </button>
            <button 
              onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                place.name + " " + place.vicinity
              )}${
      place.placeId ? "&query_place_id=" + place.placeId : ""
    }', '_blank')"
              class="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              Maps
            </button>
          </div>
        </div>
      </div>
    `;
  };

  if (!mapLoaded) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mx-auto mb-2"></div>
          <div className="text-gray-500">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MapControls
        userLocation={userLocation}
        locationPermission={locationPermission}
        isGettingLocation={isGettingLocation}
        showUserLocationRoutes={showUserLocationRoutes}
        routeMode={routeMode}
        getUserLocation={getUserLocation}
        setShowUserLocationRoutes={setShowUserLocationRoutes}
        setRouteMode={setRouteMode}
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Transport Locations</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">
                  🚌
                </div>
                <span className="text-gray-600">Eco-Friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
                  🚌
                </div>
                <span className="text-gray-600">Selected</span>
              </div>
              {userLocation && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                    📍
                  </div>
                  <span className="text-gray-600">Your Location</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div id="route-info" className="mb-4">
            {/* Route info will be populated by JavaScript */}
          </div>

          {/* Route Instructions */}
          {userLocation && !selectedTransport && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <span>🗺️</span>
                <span className="text-sm font-medium">
                  Click any transport marker to see route from your location.
                </span>
              </div>
            </div>
          )}

          {/* Selected Transport Details */}
          {selectedTransport && (
            <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {selectedTransport.icon || "🚌"}
                  </span>
                  <h4 className="font-bold text-lg text-gray-900">
                    Selected Transport
                  </h4>
                </div>
                <button
                  onClick={() => onTransportSelect(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image */}
                {selectedTransport.photos &&
                  selectedTransport.photos.length > 0 && (
                    <div className="md:col-span-1">
                      <img
                        src={selectedTransport.photos[0].url}
                        alt={selectedTransport.name}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                {/* Details */}
                <div
                  className={
                    selectedTransport.photos &&
                    selectedTransport.photos.length > 0
                      ? "md:col-span-2"
                      : "md:col-span-3"
                  }
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                      {selectedTransport.ecoScore ||
                        selectedTransport.carbonRating ||
                        3}
                      /5 Eco
                    </span>
                    {selectedTransport.rating &&
                      selectedTransport.rating !== "N/A" && (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          ⭐ {selectedTransport.rating}/5
                        </span>
                      )}
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {formatTransportType(selectedTransport)}
                    </span>
                  </div>

                  <h5 className="font-bold text-xl text-gray-900 mb-2">
                    {selectedTransport.name}
                  </h5>

                  {selectedTransport.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {selectedTransport.description}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <span className="mr-1">📍</span>
                    <span>{getLocationText(selectedTransport)}</span>
                  </div>

                  {/* Environmental Impact */}
                  <div className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <div className="text-sm font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                      🌱 Environmental Impact
                    </div>
                    <div className="text-sm text-emerald-700">
                      {(() => {
                        const { factor, isZeroEmissions, message } =
                          getCarbonEmissionInfo(selectedTransport);
                        return isZeroEmissions ? (
                          <span className="text-green-600 font-medium">
                            Zero emissions! Perfect eco choice 🌱
                          </span>
                        ) : (
                          <div>
                            <div className="font-medium">
                              {factor || "Low impact"} kg CO₂/km
                            </div>
                            <div className="text-xs text-emerald-600 mt-1">
                              {message}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Status */}
                  {selectedTransport.openNow !== undefined && (
                    <div className="mb-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedTransport.openNow
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedTransport.openNow
                          ? "🟢 Open Now"
                          : "🔴 Closed"}
                      </span>
                    </div>
                  )}

                  {/* User Ratings */}
                  {selectedTransport.userRatingsTotal &&
                    selectedTransport.userRatingsTotal > 0 && (
                      <div className="mb-3 text-sm text-gray-600">
                        📊 {selectedTransport.userRatingsTotal} user reviews
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        const searchQuery = selectedTransport.placeId
                          ? `https://www.google.com/search?q=${encodeURIComponent(
                              selectedTransport.name +
                                " " +
                                (selectedTransport.vicinity || "") +
                                " transport information"
                            )}`
                          : `https://www.google.com/search?q=${encodeURIComponent(
                              (selectedTransport.typeName ||
                                selectedTransport.transportType ||
                                "transport") +
                                " " +
                                selectedTransport.name
                            )}`;
                        window.open(searchQuery, "_blank");
                      }}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      Get Info
                    </button>
                    <button
                      onClick={() => {
                        const mapsQuery = selectedTransport.placeId
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              selectedTransport.name +
                                " " +
                                (selectedTransport.vicinity || "")
                            )}&query_place_id=${selectedTransport.placeId}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              selectedTransport.name + " transport"
                            )}`;
                        window.open(mapsQuery, "_blank");
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      View on Maps
                    </button>
                    {userLocation && (
                      <button
                        onClick={() => {
                          const transportLocation = selectedTransport.location;
                          if (transportLocation) {
                            const position = {
                              lat:
                                transportLocation.lat ||
                                transportLocation.latitude,
                              lng:
                                transportLocation.lng ||
                                transportLocation.longitude,
                            };

                            calculateRouteFromUserLocation(
                              userLocation,
                              position,
                              routeMode,
                              directionsService,
                              directionsRenderer,
                              "route-info"
                            );
                          }
                        }}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        🗺️ Route
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          id="transport-map"
          className="w-full"
          style={{ minHeight: "500px" }}
        >
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mx-auto mb-2"></div>
              <div className="text-gray-500">Initializing map...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 p-6 rounded-xl">
          <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
            🚌 Transport Options Found
          </h3>
          <div className="space-y-2">
            <div className="text-emerald-700 font-medium text-sm">
              Total:{" "}
              {transportOptions.reduce(
                (sum, type) => sum + (type.places?.length || 0),
                0
              )}{" "}
              eco-friendly options
            </div>
            <div className="text-emerald-700 text-sm">
              Transport Types: {transportOptions.length}
            </div>
            <div className="text-emerald-700 text-sm">
              Average Eco Score:{" "}
              {transportOptions.length > 0
                ? (
                    transportOptions.reduce(
                      (sum, type) => sum + (type.ecoScore || 0),
                      0
                    ) / transportOptions.length
                  ).toFixed(1)
                : 0}
              /5
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
            🗺️ Map Instructions
          </h3>
          <div className="space-y-1 text-blue-700 text-sm">
            <div>• Click markers to see transport details</div>
            <div>• Enable location to get directions</div>
            <div>• Selected transport appears in red</div>
            <div>• Colors indicate eco-friendliness</div>
            <div>• Use controls above to customize routes</div>
          </div>
        </div>
      </div>

      {/* Eco Score Legend */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          🌱 Eco-Friendliness Scale
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
            <span className="text-sm text-gray-700">5 - Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span className="text-sm text-gray-700">4 - Very Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
            <span className="text-sm text-gray-700">3 - Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
            <span className="text-sm text-gray-700">2 - Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">1 - Limited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
