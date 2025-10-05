import { NextResponse } from "next/server";
import { hasAmadeusCredentials, makeAmadeusRequest } from "@/lib/amadeus";

// GeoDB API for city coordinates (primary source)
async function getGeoCityCoordinates(cityName) {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      console.warn("RapidAPI key not configured");
      return null;
    }

    const response = await fetch(
      `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(
        cityName
      )}&limit=1`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const city = data.data[0];
        return {
          latitude: city.latitude,
          longitude: city.longitude,
          formattedAddress: `${city.name}, ${city.countryCode}`,
        };
      }
    }
  } catch (error) {
    console.warn("GeoDB geocoding failed:", error);
  }
  return null;
}

// Geocode city name to get coordinates with priority order
async function getCityCoordinates(cityName) {
  // Priority 1: GeoDB API (primary service)
  const geoDbResult = await getGeoCityCoordinates(cityName);
  if (geoDbResult) {
    return geoDbResult;
  }

  // Priority 2: Google Maps Geocoding (secondary)
  if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          cityName
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          return {
            latitude: location.lat,
            longitude: location.lng,
            formattedAddress: data.results[0].formatted_address,
          };
        }
      }
    } catch (error) {
      console.warn("Google Maps geocoding failed:", error);
    }
  }

  // Priority 3: Fallback to predefined coordinates
  const coordinates = {
    paris: { latitude: 48.8566, longitude: 2.3522 },
    london: { latitude: 51.5074, longitude: -0.1278 },
    "new york": { latitude: 40.7128, longitude: -74.006 },
    madrid: { latitude: 40.4168, longitude: -3.7038 },
    barcelona: { latitude: 41.3851, longitude: 2.1734 },
    rome: { latitude: 41.9028, longitude: 12.4964 },
    tokyo: { latitude: 35.6762, longitude: 139.6503 },
    dubai: { latitude: 25.2048, longitude: 55.2708 },
    singapore: { latitude: 1.3521, longitude: 103.8198 },
    amsterdam: { latitude: 52.3676, longitude: 4.9041 },
    berlin: { latitude: 52.52, longitude: 13.405 },
    zurich: { latitude: 47.3769, longitude: 8.5417 },
    bangkok: { latitude: 13.7563, longitude: 100.5018 },
    sydney: { latitude: -33.8688, longitude: 151.2093 },
    milan: { latitude: 45.4642, longitude: 9.19 },
    vienna: { latitude: 48.2082, longitude: 16.3738 },
  };

  const key = cityName.toLowerCase().trim();
  return coordinates[key] || { latitude: 40.7128, longitude: -74.006 }; // Default to NYC
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const radius = searchParams.get("radius") || "1";

    let coords;
    let locationName = city || "Unknown Location";

    // Priority 1: Use coordinates if provided (from city suggestions)
    if (latitude && longitude) {
      coords = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
    } else if (city) {
      // Priority 2: Geocode the city name as fallback
      coords = await getCityCoordinates(city);
      // ('Geocoded coordinates for', city, ':', coords);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "City name or coordinates are required",
        },
        { status: 400 }
      );
    }
    // ("coords here ", coords);
    // Check if Amadeus credentials are available
    if (!hasAmadeusCredentials()) {
      return NextResponse.json(
        {
          success: false,
          error: "API credentials not configured",
        },
        { status: 500 }
      );
    }

    // Search for activities using centralized utility
    const params = new URLSearchParams({
      latitude: coords.latitude.toString(),
      longitude: coords.longitude.toString(),
      radius: radius,
    });

    const response = await makeAmadeusRequest(
      `/v1/shopping/activities?${params}`
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch activities",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform the activities data
    const activities =
      data.data?.map((activity) => ({
        id: activity.id,
        name: activity.name,
        description: activity.shortDescription,
        location: locationName,
        price: activity.price
          ? {
              amount: parseFloat(activity.price.amount),
              currency: activity.price.currencyCode,
            }
          : null,
        rating: activity.rating ? parseFloat(activity.rating) : null,
        image:
          activity.pictures && activity.pictures.length > 0
            ? activity.pictures[0]
            : "/placeholder.svg",
        bookingLink: activity.bookingLink,
        coordinates: {
          latitude: parseFloat(activity.geoCode.latitude),
          longitude: parseFloat(activity.geoCode.longitude),
        },
        isRealData: true,
      })) || [];

    return NextResponse.json({
      success: true,
      data: activities,
      total: data.meta?.count || activities.length,
      location: locationName,
      coordinates: coords,
      source: latitude && longitude ? "coordinates" : "geocoded",
    });
  } catch (error) {
    console.error("Activities API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
