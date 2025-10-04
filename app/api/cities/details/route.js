import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeid");
    const sessionToken = searchParams.get("sessiontoken");

    if (!placeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Place ID is required",
        },
        { status: 400 }
      );
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

    // Build Place Details API request with field masking (only geometry for cost optimization)
    const params = new URLSearchParams({
      place_id: placeId,
      fields: "geometry",
      key: apiKey,
    });

    // Add session token to complete the session and get discounted pricing
    if (sessionToken) {
      params.append("sessiontoken", sessionToken);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(data.error_message || `API error: ${data.status}`);
    }

    // Extract coordinates
    const coordinates = {
      latitude: data.result?.geometry?.location?.lat,
      longitude: data.result?.geometry?.location?.lng,
    };

    return NextResponse.json({
      success: true,
      data: coordinates,
    });
  } catch (error) {
    console.error("Place details API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch place details",
      },
      { status: 500 }
    );
  }
}
