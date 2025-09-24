"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { MapPin, Star, Loader2 } from "lucide-react";

export default function FeaturedDestinations() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Featured cities to showcase
  const featuredCities = [
    { name: "Paris", coords: { latitude: 48.8566, longitude: 2.3522 } },
    { name: "London", coords: { latitude: 51.5074, longitude: -0.1278 } },
    { name: "Tokyo", coords: { latitude: 35.6762, longitude: 139.6503 } },
  ];

  useEffect(() => {
    const loadFeaturedActivities = async () => {
      try {
        setLoading(true);
        const allActivities = [];
        const seenActivityIds = new Set(); // Track unique activity IDs

        // Load activities from featured cities
        for (const city of featuredCities) {
          try {
            const response = await fetch(
              `/api/activities?city=${encodeURIComponent(city.name)}&latitude=${
                city.coords.latitude
              }&longitude=${city.coords.longitude}&radius=10`
            );
            const data = await response.json();
            if (data.success && data.data) {
              // Take first 2 activities from each city, ensure uniqueness
              const cityActivities = data.data
                .slice(0, 2)
                .map((activity) => ({
                  ...activity,
                  cityName: city.name,
                  // Ensure unique ID by combining with city if needed
                  id:
                    activity.id ||
                    `${city.name}-${activity.name}-${Math.random()}`,
                }))
                .filter((activity) => {
                  // Only include if we haven't seen this activity ID before
                  if (seenActivityIds.has(activity.id)) {
                    return false;
                  }
                  seenActivityIds.add(activity.id);
                  return true;
                });

              allActivities.push(...cityActivities);
            }
          } catch (cityError) {
            console.warn(
              `Failed to load activities for ${city.name}:`,
              cityError
            );
          }
        }

        setActivities(allActivities.slice(0, 6)); // Show max 6 activities
      } catch (err) {
        console.error("Error loading featured activities:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedActivities();
  }, []);
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Eco Activities</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover sustainable activities from around the world that offer
            unforgettable experiences while supporting environmental
            conservation and local communities.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2
                size={32}
                className="animate-spin text-green-600 mx-auto mb-2"
              />
              <p className="text-gray-600">Loading featured activities...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <p className="text-lg font-medium mb-2">
                Unable to load featured activities
              </p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Activities Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity, index) => (
              <Link
                href={`/activities/${activity.id}`}
                key={`activity-${activity.id}-${index}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:shadow-lg hover:scale-105">
                  <div className="relative h-48 w-full">
                    <Image
                      src={activity.image || "/placeholder.svg"}
                      alt={activity.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* City Badge */}
                    <div className="absolute bottom-0 left-0 bg-green-600 text-white px-3 py-1 text-sm font-medium">
                      {activity.cityName}
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium">
                      {activity.price
                        ? `${activity.price.amount} ${activity.price.currency}`
                        : "Free"}
                    </div>

                    {/* Real Data Indicator */}
                    {activity.isRealData && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Live Data
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">
                      {activity.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin size={14} className="mr-1" />
                      <span>{activity.location}</span>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {activity.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      {activity.rating ? (
                        <div className="flex items-center">
                          <Star
                            size={16}
                            className="text-yellow-400 fill-current"
                          />
                          <span className="ml-1 text-sm font-medium">
                            {activity.rating}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-green-600 font-medium">
                          Eco Activity
                        </span>
                      )}

                      <div className="text-green-600 text-sm font-medium group-hover:text-green-700">
                        View Details →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Show message if no activities loaded */}
        {!loading && !error && activities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <h3 className="text-lg font-medium mb-2">
                No featured activities available
              </h3>
              <p>Check out our destinations page for more options.</p>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/destinations"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
          >
            Explore All Activities
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
