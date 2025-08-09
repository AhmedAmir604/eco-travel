import Image from "next/image"
import Link from "next/link"
import { dummyAccommodations } from "@/data/dummy-data"
import { Filter, Search, MapPin } from "lucide-react"

export default function AccommodationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Eco-Friendly Accommodations</h1>
          <p className="text-gray-600 mb-6">
            Discover sustainable places to stay that minimize environmental impact while providing comfortable and
            memorable experiences.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search accommodations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Destinations</option>
              <option value="costa-rica">Costa Rica</option>
              <option value="iceland">Iceland</option>
              <option value="new-zealand">New Zealand</option>
              <option value="bhutan">Bhutan</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Eco Ratings</option>
              <option value="5">5 Star Eco Rating</option>
              <option value="4">4+ Star Eco Rating</option>
              <option value="3">3+ Star Eco Rating</option>
            </select>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center">
              <Filter size={18} className="mr-2" />
              More Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyAccommodations.map((accommodation) => (
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
                <p className="text-gray-700 text-sm mb-3">{accommodation.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {accommodation.features.map((feature) => (
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
