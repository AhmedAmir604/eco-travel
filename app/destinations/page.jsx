import Image from "next/image"
import Link from "next/link"
import { dummyDestinations } from "@/data/dummy-data"
import { Filter, Search, MapPin } from "lucide-react"

export default function DestinationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Eco-Friendly Destinations</h1>
          <p className="text-gray-600 mb-6">
            Explore sustainable destinations that prioritize environmental conservation, support local communities, and
            offer authentic experiences.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search destinations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Regions</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="americas">Americas</option>
              <option value="africa">Africa</option>
              <option value="oceania">Oceania</option>
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
          {dummyDestinations.map((destination) => (
            <Link href={`/destinations/${destination.id}`} key={destination.id} className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:shadow-lg">
                <div className="relative h-48 w-full">
                  <Image
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 bg-green-600 text-white px-3 py-1 text-sm font-medium">
                    {destination.ecoRating}/5 Eco Rating
                  </div>
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium">
                    ${destination.priceRange.min} - ${destination.priceRange.max}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">
                    {destination.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin size={14} className="mr-1" />
                    <span>{destination.location}</span>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-2">{destination.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {destination.tags.map((tag) => (
                      <span key={tag} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${star <= destination.ecoRating ? "text-yellow-400" : "text-gray-300"}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{destination.reviewCount} reviews</span>
                    </div>
                    <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-md group-hover:bg-green-700 transition-colors">
                      Explore
                    </span>
                  </div>
                </div>
              </div>
            </Link>
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
