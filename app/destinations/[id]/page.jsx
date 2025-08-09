import Image from "next/image"
import Link from "next/link"
import { dummyDestinations, dummyAccommodations, dummyTransportOptions, dummyActivities } from "@/data/dummy-data"
import { MapPin, Calendar, Users, Clock, Leaf, ThumbsUp, AlertTriangle } from "lucide-react"

export default function DestinationDetailPage({ params }) {
  // Find the destination by ID from our dummy data
  const destination = dummyDestinations.find((d) => d.id === params.id) || dummyDestinations[0]

  // Get related accommodations, transport options, and activities
  const accommodations = dummyAccommodations.filter((a) => a.destinationId === destination.id).slice(0, 3)
  const transportOptions = dummyTransportOptions.filter((t) => t.destinationId === destination.id).slice(0, 3)
  const activities = dummyActivities.filter((a) => a.destinationId === destination.id).slice(0, 4)

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Section */}
      <div className="relative h-96">
        <Image
          src={destination.image || "/placeholder.svg"}
          alt={destination.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-2">
              <MapPin size={18} className="mr-1" />
              <span>{destination.location}</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{destination.name}</h1>
            <div className="flex items-center">
              <div className="flex mr-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${star <= destination.ecoRating ? "text-yellow-400" : "text-gray-300"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>
                {destination.ecoRating}/5 Eco Rating • {destination.reviewCount} reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">About {destination.name}</h2>
              <p className="text-gray-700 mb-6">{destination.description}</p>
              <p className="text-gray-700 mb-6">
                {destination.longDescription ||
                  "This eco-friendly destination offers a perfect balance of natural beauty and sustainable tourism practices. The local community is actively involved in conservation efforts, and visitors can enjoy pristine environments while minimizing their environmental impact."}
              </p>

              <h3 className="text-xl font-semibold mb-3">Sustainability Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {destination.sustainabilityFeatures?.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Leaf size={18} className="text-green-600 mr-2" />
                    <span>{feature}</span>
                  </div>
                )) || (
                  <>
                    <div className="flex items-center">
                      <Leaf size={18} className="text-green-600 mr-2" />
                      <span>Renewable Energy Sources</span>
                    </div>
                    <div className="flex items-center">
                      <Leaf size={18} className="text-green-600 mr-2" />
                      <span>Water Conservation Programs</span>
                    </div>
                    <div className="flex items-center">
                      <Leaf size={18} className="text-green-600 mr-2" />
                      <span>Waste Reduction Initiatives</span>
                    </div>
                    <div className="flex items-center">
                      <Leaf size={18} className="text-green-600 mr-2" />
                      <span>Local Community Support</span>
                    </div>
                  </>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-3">Best Time to Visit</h3>
              <p className="text-gray-700 mb-6">
                {destination.bestTimeToVisit ||
                  "The best time to visit is during the spring (April-June) and fall (September-November) when the weather is pleasant and tourist crowds are smaller, reducing the strain on local resources."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ThumbsUp size={18} className="text-green-600 mr-2" />
                    <h4 className="font-semibold">Eco-Friendly Practices</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Use public transportation or bike rentals</li>
                    <li>• Support local businesses and artisans</li>
                    <li>• Participate in beach or trail clean-ups</li>
                    <li>• Use reef-safe sunscreen if visiting marine areas</li>
                  </ul>
                </div>
                <div className="flex-1 bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle size={18} className="text-amber-600 mr-2" />
                    <h4 className="font-semibold">Things to Avoid</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Single-use plastics</li>
                    <li>• Disturbing wildlife or natural habitats</li>
                    <li>• Purchasing products made from endangered species</li>
                    <li>• Excessive water usage in drought-prone areas</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="md:w-80">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
                <h3 className="text-xl font-semibold mb-4">Plan Your Trip</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="dates" className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar size={16} className="inline mr-2" />
                      Dates
                    </label>
                    <input
                      type="text"
                      id="dates"
                      placeholder="Select dates"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="travelers" className="block text-sm font-medium text-gray-700 mb-1">
                      <Users size={16} className="inline mr-2" />
                      Travelers
                    </label>
                    <select
                      id="travelers"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="1">1 Traveler</option>
                      <option value="2">2 Travelers</option>
                      <option value="3">3 Travelers</option>
                      <option value="4">4+ Travelers</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock size={16} className="inline mr-2" />
                      Duration
                    </label>
                    <select
                      id="duration"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="weekend">Weekend Getaway (2-3 days)</option>
                      <option value="short">Short Trip (4-7 days)</option>
                      <option value="medium">Medium Trip (8-14 days)</option>
                      <option value="long">Extended Stay (15+ days)</option>
                    </select>
                  </div>
                </div>
                <button className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium">
                  Generate Eco Itinerary
                </button>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Carbon Footprint</h3>
                <p className="text-sm text-gray-700 mb-4">
                  By choosing eco-friendly options at this destination, you can reduce your carbon footprint by up to:
                </p>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">75%</div>
                  <p className="text-sm text-gray-600">compared to conventional travel</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accommodations Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Eco-Friendly Accommodations</h2>
            <Link href="/accommodations" className="text-green-600 hover:text-green-700 font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accommodations.map((accommodation) => (
              <div key={accommodation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={accommodation.image || "/placeholder.svg"}
                    alt={accommodation.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs font-medium rounded">
                    {accommodation.ecoRating}/5 Eco Rating
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{accommodation.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin size={14} className="mr-1" />
                    <span>{accommodation.location}</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">{accommodation.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {accommodation.features.slice(0, 3).map((feature) => (
                      <span key={feature} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-green-600 font-bold">
                      ${accommodation.pricePerNight} <span className="text-gray-500 font-normal text-sm">/ night</span>
                    </div>
                    <Link
                      href={`/accommodations/${accommodation.id}`}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transport Options Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Low-Carbon Transport Options</h2>
            <Link href="/transport" className="text-green-600 hover:text-green-700 font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transportOptions.map((transport) => (
              <div key={transport.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={transport.image || "/placeholder.svg"}
                    alt={transport.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs font-medium rounded">
                    {transport.carbonRating}/5 Carbon Rating
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{transport.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span>{transport.type}</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{transport.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-green-600 font-bold">
                      ${transport.price} <span className="text-gray-500 font-normal text-sm">avg.</span>
                    </div>
                    <div className="text-gray-600 text-sm">CO₂: {transport.carbonEmission} kg</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activities Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Sustainable Activities</h2>
            <Link href="/activities" className="text-green-600 hover:text-green-700 font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-40">
                  <Image src={activity.image || "/placeholder.svg"} alt={activity.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="text-md font-semibold mb-1">{activity.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Clock size={14} className="mr-1" />
                    <span>{activity.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-green-600 font-bold">${activity.price}</div>
                    <Link
                      href={`/activities/${activity.id}`}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
