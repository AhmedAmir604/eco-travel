"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Clock,
  Star,
  ExternalLink,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function ActivityDetailPage({ params }) {
  const { toast } = useToast();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityDetails();
  }, [params.activityId]);

  const loadActivityDetails = async () => {
    try {
      const response = await fetch(`/api/activities/${params.activityId}`);
      const data = await response.json();

      if (data.success) {
        setActivity(data.data);
      } else {
        toast.error("Activity not found");
      }
    } catch (error) {
      console.error("Error loading activity:", error);
      toast.error("Error loading activity details");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!activity?.bookingLink || activity.bookingLink === "#") {
      toast.error("Booking link not available");
      return;
    }

    // Open external booking site in new tab
    window.open(activity.bookingLink, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="animate-spin text-green-600 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Activity Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The activity you're looking for doesn't exist.
          </p>
          <Link
            href="/destinations"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Section */}
      <div className="relative h-96">
        <Image
          src={activity.images?.[0] || activity.image || "/placeholder.svg"}
          alt={activity.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/destinations"
              className="inline-flex items-center mb-4 text-white hover:text-green-200 transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Destinations
            </Link>
            <div className="flex items-center mb-2">
              <MapPin size={18} className="mr-2" />
              <span>{activity.location}</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{activity.name}</h1>
            <div className="flex items-center">
              {activity.rating && (
                <div className="flex items-center mr-4">
                  <Star
                    size={18}
                    className="text-yellow-400 fill-current mr-1"
                  />
                  <span className="text-lg font-medium">{activity.rating}</span>
                </div>
              )}
              {activity.price && (
                <div className="text-2xl font-bold">
                  {activity.price.amount} {activity.price.currency}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">About This Activity</h2>
              <p className="text-gray-700 mb-6">{activity.description}</p>

              {activity.longDescription &&
                activity.longDescription !== activity.description && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">
                      Detailed Description
                    </h3>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: activity.longDescription,
                      }}
                    />
                  </div>
                )}

              {/* Activity Details - Only show if duration exists */}
              {activity.duration && (
                <div className="mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-lg">
                    <Clock size={20} className="text-green-600 mr-2" />
                    <div>
                      <div className="text-xs text-gray-600">Duration</div>
                      <div className="text-sm font-medium text-gray-800">
                        {activity.duration}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:w-80">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
                <div className="text-center mb-6">
                  {activity.price ? (
                    <>
                      <div className="text-sm text-gray-600 mb-1">From</div>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {activity.price.amount} {activity.price.currency}
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      Price Available on Booking
                    </div>
                  )}
                  {activity.rating && (
                    <div className="flex items-center justify-center">
                      <Star
                        size={16}
                        className="text-yellow-400 fill-current mr-1"
                      />
                      <span className="text-sm font-medium">
                        {activity.rating} rating
                      </span>
                    </div>
                  )}
                </div>

                {activity.bookingLink && activity.bookingLink !== "#" ? (
                  <button
                    onClick={handleBooking}
                    className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <ExternalLink size={20} className="mr-2" />
                    Book on Official Site
                  </button>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Booking information not available
                    </p>
                  </div>
                )}

                {/* Eco-Friendly Badge */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🌱</span>
                    </div>
                    <h4 className="font-semibold text-green-800">
                      Eco-Friendly Activity
                    </h4>
                  </div>
                  <p className="text-sm text-green-700">
                    This activity supports sustainable tourism and local
                    communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Images */}
        {activity.images && activity.images.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">More Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activity.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="relative h-32 rounded-lg overflow-hidden"
                >
                  <Image
                    src={image}
                    alt={`${activity.name} - Photo ${index + 2}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast Container is now global in layout */}
    </main>
  );
}
