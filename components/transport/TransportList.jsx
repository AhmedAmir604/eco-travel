"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Leaf, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import TransportDetailsModal from "./TransportDetailsModal";

export default function TransportList({
  transportOptions,
  selectedTransport,
  onTransportSelect,
  paginationLoading,
  getTransportIcon,
  getEcoPreference,
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedTransportForModal, setSelectedTransportForModal] =
    useState(null);

  const navigateToTransportDetail = (transport) => {
    localStorage.setItem("selectedTransport", JSON.stringify(transport));
    const transportId =
      transport.id || transport.placeId || `${transport.type}-${Date.now()}`;
    router.push(`/transport/${transportId}`);
  };

  const handleTransportClick = (transport) => {
    onTransportSelect?.(transport);
    // Show modal instead of navigating immediately
    setSelectedTransportForModal(transport);
    setShowModal(true);
  };

  const handleViewDetails = (transport) => {
    setSelectedTransportForModal(transport);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransportForModal(null);
  };

  // Handle both flat array and nested array structures
  const flattenedTransportOptions = transportOptions.flatMap((item) => {
    // If item has places array (Google Maps API structure)
    if (item.places && Array.isArray(item.places)) {
      return item.places.map((place) => ({
        ...place,
        type: item.type,
        ecoScore: item.ecoScore,
        carbonFactor: item.carbonFactor,
        icon: item.icon,
        description: item.description,
        name: place.name,
        id: place.placeId || place.id,
      }));
    }
    // Otherwise, treat as direct transport option (existing structure)
    return [item];
  });

  return (
    <div
      className={`transition-opacity duration-300 ${
        paginationLoading ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {flattenedTransportOptions.map((transport) => {
          const ecoPreference = getEcoPreference(transport);
          const isSelected =
            selectedTransport?.placeId === transport.placeId ||
            selectedTransport?.id === transport.id;

          return (
            <div
              key={
                transport.placeId ||
                transport.id ||
                `${transport.type}-${transport.name}`
              }
              className={`bg-white rounded-xl shadow-lg border-2 ${
                isSelected
                  ? "border-red-500 ring-2 ring-red-200"
                  : ecoPreference.borderColor
              } relative cursor-pointer transition-all hover:shadow-xl overflow-hidden`}
              onClick={() => handleTransportClick(transport)}
            >
              {/* Eco Preference Banner */}
              <div
                className={`${ecoPreference.bgColor} ${ecoPreference.textColor} px-4 py-3 text-center text-sm font-medium`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{ecoPreference.icon}</span>
                  <span>{ecoPreference.label}</span>
                  {isSelected && (
                    <span className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
                      SELECTED
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Header with Icon and Name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {transport.icon || getTransportIcon(transport.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {transport.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transport.type
                          ? transport.type
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())
                          : "Transport Option"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                      {transport.ecoScore || transport.carbonRating || 3}/5 Eco
                    </div>
                    {transport.rating && transport.rating !== "N/A" && (
                      <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Star size={12} className="fill-current" />
                        {transport.rating}
                      </div>
                    )}
                  </div>
                </div>

                {/* Transport Image */}
                {((transport.photos && transport.photos.length > 0) ||
                  transport.image) && (
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={transport.photos?.[0]?.url || transport.image}
                      alt={transport.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPin size={14} className="mr-1 flex-shrink-0" />
                  <span>
                    {transport.vicinity ||
                      transport.destination ||
                      transport.location ||
                      "Location available"}
                  </span>
                </div>

                {/* Description */}
                {transport.description && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {transport.description}
                  </p>
                )}

                {/* Eco Preference Message */}
                <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                  <div className="text-sm text-emerald-800 font-medium">
                    {ecoPreference.icon} {ecoPreference.message}
                  </div>
                </div>

                {/* Environmental Impact */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
                    <Leaf size={14} />
                    Environmental Impact
                  </h4>
                  <div className="text-sm text-blue-700">
                    {transport.carbonFactor === 0 ||
                    transport.carbonEmission === 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="text-green-600">
                          🌱 Zero emissions!
                        </span>
                      </span>
                    ) : (
                      <span>
                        {transport.carbonFactor ||
                          transport.carbonEmission ||
                          "Low"}{" "}
                        kg CO₂/km
                      </span>
                    )}
                  </div>
                  {transport.ecoImpact && (
                    <div className="text-xs text-blue-600 mt-1">
                      {transport.ecoImpact}
                    </div>
                  )}
                </div>

                {/* Area Transport Info */}
                {transport.areaTransport && (
                  <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <MapPin size={14} />
                        {transport.availability}
                      </span>
                      <span className="font-medium text-emerald-800">
                        {typeof transport.count === "number"
                          ? `${transport.count} found`
                          : transport.count}
                      </span>
                    </div>

                    {transport.hasRealData && (
                      <div className="text-xs text-emerald-600 font-medium">
                        ✅ Real-time data
                      </div>
                    )}
                  </div>
                )}

                {/* Status */}
                {transport.openNow !== undefined && (
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        transport.openNow
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transport.openNow ? "🟢 Open Now" : "🔴 Closed"}
                    </span>
                  </div>
                )}

                {/* Business Status */}
                {transport.businessStatus &&
                  transport.businessStatus !== "OPERATIONAL" && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        ⚠️{" "}
                        {transport.businessStatus
                          .replace("_", " ")
                          .toLowerCase()}
                      </span>
                    </div>
                  )}

                {/* User Ratings */}
                {transport.userRatingsTotal &&
                  transport.userRatingsTotal > 0 && (
                    <div className="mb-4 text-sm text-gray-600">
                      📊 {transport.userRatingsTotal} user reviews
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(transport);
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const mapsQuery = transport.placeId
                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            transport.name + " " + (transport.vicinity || "")
                          )}&query_place_id=${transport.placeId}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            transport.name +
                              " " +
                              (transport.vicinity ||
                                transport.destination ||
                                "")
                          )}`;
                      window.open(mapsQuery, "_blank");
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View on Maps
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transport Details Modal */}
      {showModal && selectedTransportForModal && (
        <TransportDetailsModal
          transport={selectedTransportForModal}
          onClose={handleCloseModal}
          getEcoPreference={getEcoPreference}
          getTransportIcon={getTransportIcon}
        />
      )}
    </div>
  );
}
