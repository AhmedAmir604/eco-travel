export const calculateRouteFromUserLocation = (
  userLocation,
  destination,
  travelMode,
  directionsService,
  directionsRenderer,
  routeInfoId = "route-info"
) => {
  if (!userLocation || !directionsService || !directionsRenderer) return;

  const request = {
    origin: userLocation,
    destination: destination,
    travelMode: window.google.maps.TravelMode[travelMode],
    avoidHighways: travelMode === "WALKING",
    avoidTolls: true,
  };

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);

      const route = result.routes[0];
      const leg = route.legs[0];

      const routeInfoDiv = document.getElementById(routeInfoId);
      if (routeInfoDiv) {
        const modeIcon = {
          WALKING: "🚶",
          DRIVING: "🚗",
          TRANSIT: "🚌",
        };

        routeInfoDiv.innerHTML = `
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-blue-600">${modeIcon[travelMode]}</span>
                <span class="font-medium">Route from your location</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-blue-600">📍</span>
                <span class="font-medium">${leg.distance.text}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-blue-600">⏱️</span>
                <span class="font-medium">${leg.duration.text}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-blue-600">🌱</span>
                <span class="font-medium">${
                  travelMode === "WALKING"
                    ? "0kg CO₂"
                    : travelMode === "TRANSIT"
                    ? "Low CO₂"
                    : "Standard CO₂"
                }</span>
              </div>
            </div>
          </div>
        `;
      }
    } else {
      console.error("Route calculation failed:", status);
      const routeInfoDiv = document.getElementById(routeInfoId);
      if (routeInfoDiv) {
        routeInfoDiv.innerHTML = `
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div class="flex items-center gap-2 text-sm text-red-700">
              <span>❌</span>
              <span>Unable to calculate route from your location</span>
            </div>
          </div>
        `;
      }
    }
  });
};

export const createMarkerIcon = (type, index = null) => {
  // Check if Google Maps is available
  if (typeof window === "undefined" || !window.google || !window.google.maps) {
    return null;
  }

  const icons = {
    hotel: {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="16" fill="#10b981" stroke="white" stroke-width="3"/>
          <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🏨</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(40, 40),
    },
    activity: {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="14" fill="#3b82f6" stroke="white" stroke-width="3"/>
          <text x="18" y="23" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${
            index !== null ? index + 1 : "?"
          }</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(36, 36),
    },
    user: {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="white" stroke-width="3"/>
          <circle cx="16" cy="16" r="4" fill="white"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(32, 32),
    },
  };

  return icons[type] || null;
};

export const createInfoWindowContent = (
  type,
  data,
  userLocation,
  showUserLocationRoutes
) => {
  if (type === "hotel") {
    return `
      <div class="p-3 max-w-xs">
        <h3 class="font-bold text-lg mb-2">${data.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${data.location}</p>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Eco Score: ${data.sustainabilityScore}/5</span>
          <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">★ ${data.rating}</span>
        </div>
        <p class="text-xs text-gray-500">${data.description}</p>
      </div>
    `;
  }

  if (type === "activity") {
    return `
      <div class="p-3 max-w-sm">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">${
            data.time
          }</span>
          <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">${
            data.carbonFootprint
          }kg CO₂</span>
          ${
            data.rating
              ? `<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">★ ${data.rating}/5</span>`
              : ""
          }
        </div>
        <h3 class="font-bold text-lg mb-2">${data.title}</h3>
        ${
          data.image
            ? `<img src="${data.image}" alt="${data.title}" class="w-full h-24 object-cover rounded mb-2" onerror="this.style.display='none'">`
            : ""
        }
        <p class="text-sm text-gray-600 mb-3">${data.description.substring(
          0,
          150
        )}${data.description.length > 150 ? "..." : ""}</p>
        
        ${
          data.kindsArray && data.kindsArray.length > 0
            ? `
          <div class="mb-2">
            <div class="text-xs text-gray-500 mb-1">Categories:</div>
            <div class="flex flex-wrap gap-1">
              ${data.kindsArray
                .slice(0, 4)
                .map(
                  (kind) => `
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${kind.replace(
                  /_/g,
                  " "
                )}</span>
              `
                )
                .join("")}
              ${
                data.kindsArray.length > 4
                  ? `<span class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">+${
                      data.kindsArray.length - 4
                    }</span>`
                  : ""
              }
            </div>
          </div>
        `
            : ""
        }
        
        <div class="flex flex-wrap gap-1 mb-2">
          ${
            data.ecoFeatures
              ?.map(
                (feature) => `
            <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">${feature}</span>
          `
              )
              .join("") || ""
          }
        </div>
        
        <p class="text-xs text-gray-500">📍 ${data.location}</p>
        <p class="text-xs text-gray-500">⏱️ ${data.duration}</p>
        
        ${
          data.wikidata
            ? `
          <div class="mt-2">
            <a href="https://www.wikidata.org/wiki/${data.wikidata}" target="_blank" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100">
              📊 Wikidata: ${data.wikidata}
            </a>
          </div>
        `
            : ""
        }
        
        ${
          userLocation && showUserLocationRoutes
            ? `
          <div class="mt-3 p-2 bg-green-50 rounded border border-green-200">
            <div class="text-xs text-green-700 font-medium mb-1">🗺️ Get Directions</div>
            <div class="text-xs text-green-600">Click this marker to calculate route from your location</div>
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  if (type === "user") {
    return `
      <div class="p-3">
        <h3 class="font-bold text-lg mb-2">📍 Your Current Location</h3>
        <p class="text-sm text-gray-600">Click on any activity to get directions</p>
      </div>
    `;
  }

  return "";
};

export const getMapCenter = (itinerary) => {
  const defaultCenter = { lat: 31.5203696, lng: 74.35874729999999 }; // Lahore

  if (itinerary.coordinates) {
    return { lat: itinerary.coordinates.lat, lng: itinerary.coordinates.lng };
  }

  if (itinerary.days?.[0]?.activities?.[0]?.coordinates) {
    const coords = itinerary.days[0].activities[0].coordinates;
    return { lat: coords.lat, lng: coords.lng };
  }

  if (itinerary.accommodations?.[0]?.coordinates) {
    const coords = itinerary.accommodations[0].coordinates;
    return { lat: coords.latitude, lng: coords.longitude };
  }

  return defaultCenter;
};
