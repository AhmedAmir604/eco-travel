import { NextResponse } from "next/server";
import { hasAmadeusCredentials, makeAmadeusRequest } from "@/lib/amadeus";

export async function GET(request, { params }) {
  try {
    const { activityId } = params;

    if (!activityId) {
      return NextResponse.json(
        {
          success: false,
          error: "Activity ID is required",
        },
        { status: 400 }
      );
    }

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

    // Get activity details using centralized utility
    const response = await makeAmadeusRequest(
      `/v1/shopping/activities/${activityId}`
    );
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: "Activity not found",
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch activity details",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const activity = data.data;

    // Transform the activity data - only use real fields from Amadeus API
    const activityDetail = {
      id: activity.id,
      name: activity.name,
      description:
        activity.shortDescription || activity.description || activity.name,
      longDescription: activity.description,
      price: activity.price
        ? {
            amount: parseFloat(activity.price.amount),
            currency: activity.price.currencyCode,
          }
        : null,
      rating: activity.rating ? parseFloat(activity.rating) : null,
      images:
        activity.pictures && activity.pictures.length > 0
          ? activity.pictures
          : ["/placeholder.svg"],
      bookingLink: activity.bookingLink,
      coordinates: {
        latitude: parseFloat(activity.geoCode.latitude),
        longitude: parseFloat(activity.geoCode.longitude),
      },
      duration: activity.minimumDuration || activity.duration,
      isRealData: true,
    };

    return NextResponse.json({
      success: true,
      data: activityDetail,
    });
  } catch (error) {
    console.error("Activity detail API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
