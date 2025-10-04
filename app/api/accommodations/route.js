import { NextResponse } from "next/server";
import { amadeusAPI } from "@/lib/amadeus";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const radius = searchParams.get("radius") || "25";
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adults = searchParams.get("adults") || "2";

    if (!city) {
      return NextResponse.json(
        { error: "City parameter is required" },
        { status: 400 }
      );
    }

    // Using hardcoded test token, so skip credential check

    // Set default dates if not provided (next week for 2 nights)
    const defaultCheckIn =
      checkIn ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const defaultCheckOut =
      checkOut ||
      new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // Search for hotels using precise coordinates from Google Maps

    const hotels = await amadeusAPI.searchHotels(
      city,
      defaultCheckIn,
      defaultCheckOut,
      parseInt(adults),
      parseInt(radius)
    );

    // Return results or empty state
    if (hotels.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: `No eco-friendly accommodations found in "${city}". Try searching for a nearby major city or different location.`,
        city: city,
        checkIn: defaultCheckIn,
        checkOut: defaultCheckOut,
      });
    }

    const finalHotels = hotels.slice(0, 20); // Limit to 20 results for pagination
    console.log("FF", finalHotels);
    return NextResponse.json({
      success: true,
      data: finalHotels,
      city: city,
      // cityCode: cityCode,
      checkIn: defaultCheckIn,
      checkOut: defaultCheckOut,
    });
  } catch (error) {
    console.error("API Error:", error);

    // Handle specific Amadeus API errors
    if (
      error.message.includes("Unauthorized") ||
      error.message.includes("401")
    ) {
      return NextResponse.json(
        {
          error:
            "API authentication failed. Please check your Amadeus API credentials.",
        },
        { status: 401 }
      );
    }

    if (error.message.includes("quota") || error.message.includes("429")) {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to fetch accommodations at the moment. Please try again later.",
      },
      { status: 500 }
    );
  }
}
