import Image from "next/image"
import Link from "next/link"
import { dummyDestinations } from "@/data/dummy-data"
import { Calendar, MapPin, Clock, Users, Leaf, Star } from "lucide-react"

// Sample itineraries based on destinations
const dummyItineraries = dummyDestinations.slice(0, 6).map((destination) => ({
  id: `itinerary-${destination.id}`,
  destinationId: destination.id,
  title: `Eco-Friendly ${destination.name} Adventure`,
  duration: Math.floor(Math.random() * 10) + 3, // 3-12 days
  carbonSaved: Math.floor(Math.random() * 500) + 100, // 100-600 kg
  highlights: [
    "Sustainable accommodations",
    "Low-carbon transport options",
    "Conservation activities",
    "Local community engagement",
  ],
  image: destination.image,
  price: Math.floor(Math.random() * 2000) + 500, // $500-$2500
  rating: Math.random() * 1 + 4, // 4.0-5.0
  reviewCount: Math.floor(Math.random() * 100) + 20, // 20-120
}))

export default function ItinerariesPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Eco-Friendly Itineraries</h1>
          <p className="text-gray-600 mb-6">
            Discover carefully crafted travel plans that maximize your experience while minimizing environmental impact.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Destination"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Dates"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Duration</option>
                <option value="weekend">Weekend (2-3 days)</option>
                <option value="short">Short Trip (4-7 days)</option>
                <option value="medium">Medium Trip (8-14 days)</option>
                <option value="long">Long Trip (15+ days)</option>
              </select>
              <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Travelers</option>
                <option value="1">1 Traveler</option>
                <option value="2">2 Travelers</option>
                <option value="3">3 Travelers</option>
                <option value="4">4+ Travelers</option>
              </select>
              <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Generate Custom Itinerary
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyItineraries.map((itinerary) => (
            <div key={itinerary.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
              <div className="relative h-48 md:h-auto md:w-48">
                <Image
                  src={itinerary.image || "/placeholder.svg"}
                  alt={itinerary.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs font-medium rounded flex items-center">
                  <Leaf size={12} className="mr-1" />
                  Eco-Friendly
                </div>
              </div>
              <div className="p-4 flex-1">
                <h3 className="text-lg font-semibold mb-1">{itinerary.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Clock size={14} className="mr-1" />
                  <span>{itinerary.duration} days</span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-400 mr-1" />
                    <span>{itinerary.rating.toFixed(1)}</span>
                    <span className="ml-1">({itinerary.reviewCount})</span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Highlights:</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {itinerary.highlights.slice(0, 3).map((highlight, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="h-3 w-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">${itinerary.price}</div>
                    <div className="text-xs text-gray-500">per person</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{itinerary.carbonSaved}kg CO₂ saved</div>
                    <Link
                      href={`/itineraries/${itinerary.id}`}
                      className="mt-1 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors inline-block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <nav className="flex items-center">
            <button className="px-3 py-1 border border-gray-300 rounded-l-md text-gray-500 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border-t border-b border-gray-300 bg-green-50 text-green-600 font-medium">
              1
            </button>
            <button className="px-3 py-1 border-t border-b border-gray-300 text-gray-500 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border-t border-b border-gray-300 text-gray-500 hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      </div>
    </main>
  )
}
