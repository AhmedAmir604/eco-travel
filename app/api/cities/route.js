import { NextResponse } from "next/server";

// Get location from IP address using ipapi.co (free tier: 1000 requests/day)
async function getIPLocation(request) {
  try {
    // Get client IP from headers (works with Vercel, Netlify, Cloudflare, etc.)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfIp = request.headers.get("cf-connecting-ip"); // Cloudflare

    const ip = cfIp || forwardedFor?.split(",")[0]?.trim() || realIp;

    // Skip for localhost/private IPs
    if (
      !ip ||
      ip === "127.0.0.1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.")
    ) {
      console.log("Skipping IP geolocation: Private/localhost IP");
      return null;
    }

    console.log(`Attempting IP geolocation for: ${ip}`);

    // Fetch location data from ipapi.co with timeout
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "eco-travel-planner" },
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (!response.ok) {
      console.log(`IP API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Check for valid coordinates
    if (data.latitude && data.longitude && !data.error) {
      console.log(
        `IP Location detected: ${data.city}, ${data.country_name} (${data.latitude}, ${data.longitude})`
      );
      return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city,
        country: data.country_name,
      };
    }

    console.log("IP API returned invalid data");
    return null;
  } catch (error) {
    console.log(`IP geolocation failed: ${error.message}`);
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const sessionToken = searchParams.get("sessiontoken");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius"); // User-configurable radius in meters

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Query must be at least 2 characters long",
      });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key not found");
      return NextResponse.json(
        {
          success: false,
          error: "API configuration error",
        },
        { status: 500 }
      );
    }

    // Build Google Places Autocomplete API request
    const params = new URLSearchParams({
      input: query.trim(),
      key: apiKey,
    });

    // Add session token for cost optimization
    if (sessionToken) {
      params.append("sessiontoken", sessionToken);
    }

    // Determine location bias (Priority: GPS → IP → Fallback)
    let locationBias = null;

    if (lat && lng) {
      // Priority 1: User-provided GPS location (most accurate)
      const radiusMeters = radius || 50000; // Default 50km for GPS
      locationBias = `circle:${radiusMeters}@${lat},${lng}`;
      console.log(
        `✓ Using GPS location: ${lat}, ${lng} (radius: ${radiusMeters}m)`
      );
    } else {
      // Priority 2: Try IP-based location (automatic, no permission needed)
      const ipLocation = await getIPLocation(request);

      if (ipLocation) {
        locationBias = `circle:200000@${ipLocation.lat},${ipLocation.lng}`; // 200km for IP
        console.log(
          `✓ Using IP location: ${ipLocation.city}, ${ipLocation.country}`
        );
      } else {
        // Priority 3: Fallback to Lahore, Pakistan
        locationBias = "circle:200000@31.5204,74.3587";
        console.log("✓ Using fallback location: Lahore, Pakistan");
      }
    }

    if (locationBias) {
      params.append("locationbias", locationBias);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(data.error_message || `API error: ${data.status}`);
    }

    // Transform Google Places response to our format
    const places =
      data.predictions?.map((prediction) => {
        const terms = prediction.terms || [];

        // For structured_formatting (more accurate for all place types)
        const mainText =
          prediction.structured_formatting?.main_text ||
          terms[0]?.value ||
          prediction.description;
        const secondaryText =
          prediction.structured_formatting?.secondary_text ||
          terms
            .slice(1)
            .map((t) => t.value)
            .join(", ") ||
          "";

        return {
          id: prediction.place_id,
          name: mainText,
          address: secondaryText,
          displayName: prediction.description,
          placeId: prediction.place_id,
          types: prediction.types || [],
        };
      }) || [];

    return NextResponse.json({
      success: true,
      data: places,
      total: places.length,
    });
  } catch (error) {
    console.error("City search API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to search cities",
      },
      { status: 500 }
    );
  }
}
