// Amadeus API integration for eco-friendly accommodations

// Token cache for managing Amadeus API tokens
let tokenCache = {
  token: null,
  expiry: null,
};

// Check if Amadeus credentials are available
export function hasAmadeusCredentials() {
  return !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
}

// Get Amadeus access token with caching
export async function getAmadeusToken() {
  try {
    // Check if we have a valid cached token
    if (
      tokenCache.token &&
      tokenCache.expiry &&
      Date.now() < tokenCache.expiry
    ) {
      return tokenCache.token;
    }

    const response = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.AMADEUS_API_KEY,
          client_secret: process.env.AMADEUS_API_SECRET,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();

    // //("token we get is " , data.access_token);

    // Cache the token with safety margin (60 seconds before expiry)
    tokenCache.token = data.access_token;
    tokenCache.expiry = Date.now() + (data.expires_in - 60) * 1000;

    return tokenCache.token;
  } catch (error) {
    console.error("Error getting Amadeus token:", error);
    // Clear cache on error
    tokenCache.token = null;
    tokenCache.expiry = null;
    throw error;
  }
}

// Make authenticated Amadeus API request
export async function makeAmadeusRequest(endpoint, options = {}) {
  try {
    const token = await getAmadeusToken();

    const response = await fetch(`https://test.api.amadeus.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      await handleAmadeusError(response, endpoint);
    }

    return response;
  } catch (error) {
    console.error(`Amadeus API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Handle Amadeus API errors with context
export async function handleAmadeusError(response, context) {
  const errorText = await response.text().catch(() => "Unknown error");

  if (response.status === 401) {
    console.warn(
      `Amadeus API unauthorized for ${context}, clearing token cache`
    );
    // Clear token cache on 401 to force refresh
    tokenCache.token = null;
    tokenCache.expiry = null;
  }

  const error = new Error(
    `Amadeus API error (${response.status}): ${errorText}`
  );
  error.status = response.status;
  error.context = context;
  throw error;
}

class AmadeusAPI {
  constructor() {
    this.baseURL = "https://test.api.amadeus.com";
  }

  async getLiveToken() {
    // Use the centralized token function
    return await getAmadeusToken();
  }

  async searchHotels(cityName, checkIn, checkOut, adults = 2, radius = 25) {
    try {
      // Use centralized token management
      const token = await getAmadeusToken();

      // First try to get precise coordinates using Google Maps Geocoding
      let coordinates;
      try {
        const { geocodeAddress } = await import("./google-maps-transport.js");
        const geocodeResult = await geocodeAddress(cityName);
        coordinates = {
          latitude: geocodeResult.location.lat,
          longitude: geocodeResult.location.lng,
        };
      } catch (geocodeError) {
        coordinates = this.getCityCoordinates(cityName);
      }

      // Search hotels using precise coordinates
      const params = new URLSearchParams({
        latitude: coordinates.latitude.toString(),
        longitude: coordinates.longitude.toString(),
        radius: radius.toString(),
        radiusUnit: "KM",
        hotelSource: "ALL",
        amenities: "RESTAURANT,WIFI,FITNESS_CENTER,SPA,SWIMMING_POOL",
        ratings: "3,4,5",
      });

      const response = await makeAmadeusRequest(
        `/v1/reference-data/locations/hotels/by-geocode?${params}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.data?.length > 0) {
          return await this.convertToEcoHotels(
            data.data.slice(0, 10),
            cityName
          );
        }
      }

      return [];
    } catch (error) {
      console.error("Error searching hotels:", error);
      return [];
    }
  }

  async convertToEcoHotels(hotelList, cityName) {
    const ecoFeatures = [
      "Eco-Certified",
      "Energy Efficient",
      "Solar Power",
      "Water Conservation",
      "Organic Food",
      "Recycling Program",
      "Green Building",
      "Local Sourcing",
      "Carbon Neutral",
      "Waste Reduction",
      "EV Charging",
    ];

    // Process hotels in parallel to get images
    const hotelsWithImages = await Promise.all(
      hotelList.map(async (hotel, index) => {
        const features = ecoFeatures
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        const distance = hotel.distance
          ? `${hotel.distance.value.toFixed(1)} ${hotel.distance.unit}`
          : "";

        // Get hotel image from Google Places
        const hotelImageData = await this.getHotelImage(hotel.name, cityName);

        return {
          id: hotel.hotelId,
          name: hotel.name,
          location: `${cityName}${
            distance ? ` (${distance} from center)` : ""
          }`,
          description:
            "Eco-friendly accommodation committed to sustainable practices and environmental responsibility.",
          image: hotelImageData?.url || "/placeholder.svg", // High quality main image
          thumbnail: hotelImageData?.thumbnail || "/placeholder.svg", // Medium quality for lists
          images: hotelImageData || { url: "/placeholder.svg" }, // All image sizes
          ecoRating: Math.min(3.5 + Math.random() * 1.5, 5).toFixed(1),
          pricePerNight: 0, // No pricing from hotel list API
          currency: "USD",
          features,
          amenities: ["Restaurant", "WiFi", "Fitness Center"],
          rating: Math.min(3.5 + Math.random() * 1.5, 5).toFixed(1),
          chainCode: hotel.chainCode,
          distance: hotel.distance,
          coordinates: hotel.geoCode,
        };
      })
    );

    return hotelsWithImages;
  }

  async getHotelImage(hotelName, cityName) {
    try {
      // Import Google Maps functions
      const { getPlacePhotoUrl } = await import("./google-maps-transport.js");

      // Search for the hotel in Google Places
      const searchQuery = `${hotelName} hotel ${cityName}`;
      const placeData = await this.searchGooglePlaces(searchQuery);

      if (placeData && placeData.photos && placeData.photos.length > 0) {
        // Get high-quality image (increased from 400x300 to 800x600)
        const mainImage = getPlacePhotoUrl(
          placeData.photos[0].photo_reference,
          800,
          600
        );

        // Return an object with multiple image sizes for different use cases
        return {
          url: mainImage, // High quality for main display
          thumbnail: getPlacePhotoUrl(
            placeData.photos[0].photo_reference,
            400,
            300
          ), // Medium for lists
          high: getPlacePhotoUrl(
            placeData.photos[0].photo_reference,
            1200,
            800
          ), // Very high quality
          small: getPlacePhotoUrl(
            placeData.photos[0].photo_reference,
            300,
            200
          ), // Small thumbnails
        };
      }

      return null;
    } catch (error) {
      console.error(`Error getting image for ${hotelName}:`, error);
      return null;
    }
  }

  async searchGooglePlaces(query) {
    try {
      const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!GOOGLE_MAPS_API_KEY) {
        console.warn("Google Maps API key not configured");
        return null;
      }

      const params = new URLSearchParams({
        query,
        key: GOOGLE_MAPS_API_KEY,
        type: "lodging",
      });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        return data.results[0]; // Return the first result
      }

      return null;
    } catch (error) {
      console.error("Error searching Google Places:", error);
      return null;
    }
  }

  getCityCoordinates(cityName) {
    const coordinates = {
      paris: { latitude: 48.8566, longitude: 2.3522 },
      london: { latitude: 51.5074, longitude: -0.1278 },
      "new york": { latitude: 40.7128, longitude: -74.006 },
      tokyo: { latitude: 35.6762, longitude: 139.6503 },
      dubai: { latitude: 25.2048, longitude: 55.2708 },
      singapore: { latitude: 1.3521, longitude: 103.8198 },
      bangkok: { latitude: 13.7563, longitude: 100.5018 },
      amsterdam: { latitude: 52.3676, longitude: 4.9041 },
      barcelona: { latitude: 41.3851, longitude: 2.1734 },
      rome: { latitude: 41.9028, longitude: 12.4964 },
      madrid: { latitude: 40.4168, longitude: -3.7038 },
      berlin: { latitude: 52.52, longitude: 13.405 },
      zurich: { latitude: 47.3769, longitude: 8.5417 },
      "costa rica": { latitude: 9.7489, longitude: -83.7534 },
      iceland: { latitude: 64.1466, longitude: -21.9426 },
      "new zealand": { latitude: -36.8485, longitude: 174.7633 },
      norway: { latitude: 59.9139, longitude: 10.7522 },
      switzerland: { latitude: 47.3769, longitude: 8.5417 },
      lahore: { latitude: 31.5204, longitude: 74.3587 },
    };

    return (
      coordinates[cityName.toLowerCase().trim()] || {
        latitude: 40.7128,
        longitude: -74.006,
      }
    );
  }

  async getHotelOffers(hotelId, checkIn, checkOut, adults = 1) {
    try {
      const params = new URLSearchParams({
        hotelIds: hotelId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: adults.toString(),
        roomQuantity: "1",
        currency: "USD",
        lang: "EN",
      });

      const response = await makeAmadeusRequest(
        `/v3/shopping/hotel-offers?${params}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.data && data.data.length > 0) {
          const hotelData = data.data[0];

          // Get hotel image
          const hotelImage = await this.getHotelImage(hotelData.hotel.name, "");

          return {
            id: hotelData.hotel.hotelId,
            name: hotelData.hotel.name,
            location: `${hotelData.hotel.cityCode}`,
            description:
              "Eco-friendly accommodation committed to sustainable practices and environmental responsibility.",
            image: hotelImage || "/placeholder.svg",
            ecoRating: Math.min(3.5 + Math.random() * 1.5, 5).toFixed(1),
            rating: Math.min(3.5 + Math.random() * 1.5, 5).toFixed(1),
            chainCode: hotelData.hotel.chainCode,
            coordinates: {
              latitude: hotelData.hotel.latitude,
              longitude: hotelData.hotel.longitude,
            },
            features: [
              "Eco-Certified",
              "Energy Efficient",
              "Solar Power",
              "Water Conservation",
              "Organic Food",
              "Recycling Program",
            ]
              .sort(() => 0.5 - Math.random())
              .slice(0, 4),
            amenities: [
              "Restaurant",
              "WiFi",
              "Fitness Center",
              "Swimming Pool",
            ],
            offers: hotelData.offers || [],
            available: hotelData.available || false,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting hotel offers:", error);
      return null;
    }
  }
}

export const amadeusAPI = new AmadeusAPI();
