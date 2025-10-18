"use client";

import {
  X,
  MapPin,
  Clock,
  Leaf,
  Star,
  Users,
  Calendar,
  Navigation,
  DollarSign,
  TreePine,
  Car,
  Building2,
} from "lucide-react";
import { useState, useEffect } from "react";

// Helper function to strip HTML tags and decode HTML entities
function stripHtml(html) {
  if (!html) return "";

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, " ");

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Remove extra whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

export default function ItineraryDetails({ itinerary, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (
      !window.google &&
      !document.querySelector('script[src*="maps.googleapis.com"]')
    ) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && activeTab === "map" && itinerary.coordinates) {
      initializeMap();
    }
  }, [mapLoaded, activeTab, itinerary]);

  const initializeMap = () => {
    const mapElement = document.getElementById("itinerary-map");
    if (!mapElement || !window.google) return;

    const map = new window.google.maps.Map(mapElement, {
      center: {
        lat: itinerary.coordinates.lat,
        lng: itinerary.coordinates.lng,
      },
      zoom: 12,
      styles: [
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    // Add markers for accommodations
    if (itinerary.accommodations) {
      itinerary.accommodations.forEach((hotel, index) => {
        if (hotel.coordinates) {
          new window.google.maps.Marker({
            position: {
              lat: hotel.coordinates.latitude,
              lng: hotel.coordinates.longitude,
            },
            map: map,
            title: hotel.name,
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#10b981" stroke="white" stroke-width="2"/>
                  <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🏨</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
            },
          });
        }
      });
    }

    // Add markers for daily activities
    if (itinerary.days) {
      itinerary.days.forEach((day, dayIndex) => {
        day.activities.forEach((activity, actIndex) => {
          if (activity.coordinates) {
            new window.google.maps.Marker({
              position: {
                lat: activity.coordinates.lat,
                lng: activity.coordinates.lng,
              },
              map: map,
              title: activity.title,
              icon: {
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="10" fill="#3b82f6" stroke="white" stroke-width="2"/>
                    <text x="14" y="18" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${
                      dayIndex + 1
                    }</text>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(28, 28),
              },
            });
          }
        });
      });
    }
  };

  if (!itinerary) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: MapPin },
    { id: "itinerary", label: "Daily Plan", icon: Calendar },
    { id: "accommodations", label: "Hotels", icon: Building2 },
    { id: "transport", label: "Transport", icon: Car },
    { id: "map", label: "Map View", icon: Navigation },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold mb-2">
            {itinerary.title || `${itinerary.destination} Adventure`}
          </h2>
          <div className="flex items-center gap-6 text-emerald-100">
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{itinerary.destination}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{itinerary.duration} days</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{itinerary.travelers} travelers</span>
            </div>
            <div className="flex items-center gap-1">
              <Leaf size={16} />
              <span>
                Eco Score: {itinerary.sustainability?.ecoScore || 4.5}/5
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Sustainability Metrics */}
                <div className="bg-emerald-50 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                    <Leaf size={18} />
                    Sustainability Impact
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">
                        {itinerary.sustainability?.totalCarbonSaved || 0}kg
                      </div>
                      <div className="text-sm text-gray-600">CO₂ Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">
                        {itinerary.sustainability?.ecoScore || 4.5}/5
                      </div>
                      <div className="text-sm text-gray-600">Eco Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">
                        {itinerary.sustainability?.sustainabilityPercentage ||
                          85}
                        %
                      </div>
                      <div className="text-sm text-gray-600">Sustainable</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">
                        ${itinerary.summary?.totalCost || "Custom"}
                      </div>
                      <div className="text-sm text-gray-600">Total Cost</div>
                    </div>
                  </div>
                </div>

                {/* Trip Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <DollarSign size={16} />
                      Cost Breakdown
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Accommodations:</span>
                        <span className="font-medium">
                          ${itinerary.summary?.accommodationCost || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Activities:</span>
                        <span className="font-medium">
                          ${itinerary.summary?.activitiesCost || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transport:</span>
                        <span className="font-medium">
                          ${itinerary.summary?.transportCost || 0}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${itinerary.summary?.totalCost || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <TreePine size={16} />
                      Environmental Impact
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Carbon Footprint:</span>
                        <span className="font-medium">
                          {itinerary.summary?.totalCarbonFootprint || 0}kg CO₂
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbon Saved:</span>
                        <span className="font-medium text-green-600">
                          {itinerary.sustainability?.totalCarbonSaved || 0}kg
                          CO₂
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Eco Activities:</span>
                        <span className="font-medium">
                          {itinerary.sustainability?.ecoFriendlyActivities || 0}
                          /{itinerary.sustainability?.totalActivities || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sustainability Features */}
                {itinerary.sustainability?.sustainabilityFeatures && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Sustainability Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {itinerary.sustainability.sustainabilityFeatures.map(
                        (feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg"
                          >
                            <Leaf size={16} className="text-emerald-600" />
                            <span className="text-sm text-emerald-800">
                              {feature}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Daily Itinerary Tab */}
            {activeTab === "itinerary" && itinerary.days && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Daily Itinerary
                </h3>
                <div className="space-y-6">
                  {itinerary.days.map((day) => (
                    <div
                      key={day.day}
                      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                    >
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              Day {day.day}: {day.theme}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {day.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="bg-emerald-100 px-3 py-1 rounded-full">
                              <span className="text-emerald-700 font-medium">
                                Eco Score: {day.sustainabilityScore}/5
                              </span>
                            </div>
                            <div className="bg-blue-100 px-3 py-1 rounded-full">
                              <span className="text-blue-700 font-medium">
                                ${day.estimatedCost}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        {day.activities.map((activity, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                          >
                            <div className="flex gap-4">
                              {/* Activity Image */}
                              {activity.image && (
                                <div className="w-48 h-full flex-shrink-0">
                                  <img
                                    src={activity.image}
                                    alt={activity.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}

                              {/* Activity Content */}
                              <div className="flex-1 p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded">
                                      {activity.time}
                                    </div>
                                    {activity.rating && (
                                      <div className="flex items-center gap-1 text-sm">
                                        <Star
                                          size={14}
                                          className="text-yellow-400 fill-yellow-400"
                                        />
                                        <span className="font-medium">
                                          {activity.rating}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">
                                      {activity.price ? (
                                        <span>
                                          {activity.currency || "$"}
                                          {activity.price.amount ||
                                            activity.cost}
                                        </span>
                                      ) : (
                                        <span>${activity.cost}</span>
                                      )}
                                    </div>
                                    {activity.carbonFootprint && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {activity.carbonFootprint}kg CO₂
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <h5 className="font-semibold text-gray-900 mb-2 text-lg">
                                  {activity.title}
                                </h5>
                                <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                                  {stripHtml(activity.description)}
                                </p>

                                {activity.location && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                    <MapPin size={12} />
                                    <span>{activity.location}</span>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-1 mb-3">
                                  {activity.ecoFeatures?.map(
                                    (feature, featureIdx) => (
                                      <span
                                        key={featureIdx}
                                        className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full"
                                      >
                                        {feature}
                                      </span>
                                    )
                                  )}
                                </div>

                                {/* Booking Link */}
                                {activity.bookingLink && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <a
                                      href={activity.bookingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      Book Now
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                    </a>
                                  </div>
                                )}

                                {/* Additional Pictures Gallery */}
                                {activity.pictures &&
                                  activity.pictures.length > 1 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <div className="flex gap-2 overflow-x-auto">
                                        {activity.pictures
                                          .slice(1, 4)
                                          .map((pic, picIdx) => (
                                            <img
                                              key={picIdx}
                                              src={pic}
                                              alt={`${activity.title} ${
                                                picIdx + 1
                                              }`}
                                              className="w-20 h-20 object-cover rounded flex-shrink-0"
                                              onError={(e) => {
                                                e.target.style.display = "none";
                                              }}
                                            />
                                          ))}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accommodations Tab */}
            {activeTab === "accommodations" &&
              itinerary.accommodations &&
              itinerary.accommodations.length > 0 && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Eco-Friendly Accommodations
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {itinerary.accommodations.map((hotel) => (
                      <div
                        key={hotel.id}
                        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {hotel.image && (
                          <div className="h-48 bg-gray-200 overflow-hidden">
                            <img
                              src={hotel.image}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                {hotel.name}
                              </h4>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin size={12} />
                                {hotel.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <Star size={14} className="text-yellow-400" />
                                <span className="text-sm font-medium">
                                  {hotel.rating}
                                </span>
                              </div>
                              <div className="text-xs text-emerald-600 font-medium">
                                Eco: {hotel.sustainabilityScore || 4}/5
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-4">
                            {hotel.description}
                          </p>

                          <div className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">
                                Eco Features
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {hotel.ecoFeatures?.map((feature, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">
                                Amenities
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {hotel.amenities?.map((amenity, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                              <div className="text-sm">
                                <span className="text-gray-600">
                                  Distance from center:{" "}
                                </span>
                                <span className="font-medium">
                                  {hotel.distance?.value} {hotel.distance?.unit}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-600">
                                  Carbon footprint:{" "}
                                </span>
                                <span className="font-medium text-green-600">
                                  {hotel.carbonFootprint}kg CO₂
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Transport Options Tab */}
            {activeTab === "transport" &&
              itinerary.transport &&
              itinerary.transport.length > 0 && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Sustainable Transport Options
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {itinerary.transport.map((transport, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl bg-blue-50 p-3 rounded-full">
                            {transport.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {transport.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {transport.availability}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {transport.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="bg-emerald-100 px-3 py-1 rounded-full mb-2">
                              <span className="text-sm font-medium text-emerald-700">
                                Eco Score: {transport.ecoScore}/5
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm text-green-800">
                              Carbon Savings
                            </span>
                            <span className="font-semibold text-green-600">
                              {transport.carbonSavings}kg CO₂
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm text-blue-800">
                              Available Locations
                            </span>
                            <span className="font-semibold text-blue-600">
                              {transport.count} stations
                            </span>
                          </div>

                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">
                                Recommendation:
                              </span>{" "}
                              {transport.recommendation}
                            </p>
                            <div className="text-xs text-gray-600">
                              Carbon Factor: {transport.carbonFactor}kg CO₂ per
                              km
                            </div>
                          </div>

                          {transport.places && transport.places.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">
                                Nearby Stations
                              </h5>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {transport.places
                                  .slice(0, 3)
                                  .map((place, placeIdx) => (
                                    <div
                                      key={placeIdx}
                                      className="text-xs text-gray-600 flex items-center gap-1"
                                    >
                                      <MapPin size={10} />
                                      <span>
                                        {place.name ||
                                          place.vicinity ||
                                          "Station"}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Map Tab */}
            {activeTab === "map" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Interactive Map
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                      <span>Hotels</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span>Activities</span>
                    </div>
                  </div>
                </div>
                <div
                  id="itinerary-map"
                  className="w-full h-96 bg-gray-200 rounded-lg"
                  style={{ minHeight: "400px" }}
                >
                  {!mapLoaded && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-gray-500">Loading map...</div>
                    </div>
                  )}
                </div>

                {/* Map Legend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-medium text-emerald-800 mb-2">
                      🏨 Accommodations
                    </h4>
                    <div className="space-y-1 text-sm">
                      {itinerary.accommodations
                        ?.slice(0, 3)
                        .map((hotel, idx) => (
                          <div key={idx} className="text-emerald-700">
                            • {hotel.name}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      📍 Daily Activities
                    </h4>
                    <div className="space-y-1 text-sm">
                      {itinerary.days?.slice(0, 3).map((day, idx) => (
                        <div key={idx} className="text-blue-700">
                          Day {day.day}: {day.activities?.length || 0}{" "}
                          activities
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
