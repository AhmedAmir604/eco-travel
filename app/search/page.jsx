import { dummyDestinations } from "@/data/dummy-data"
import Image from "next/image"
import Link from "next/link"
import { Filter } from "lucide-react"

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Filter size={20} className="text-gray-500" />
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Destination Type</h3>
              <div className="space-y-2">
                {["Beach", "Mountain", "City", "Countryside", "Island"].map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Eco Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`rating-${rating}`}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`rating-${rating}`} className="ml-2 text-sm text-gray-700 flex items-center">
                      {rating}+
                      <svg
                        className="h-4 w-4 text-yellow-400 ml-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Sustainability Features</h3>
              <div className="space-y-2">
                {[
                  "Renewable Energy",
                  "Water Conservation",
                  "Waste Reduction",
                  "Local Community Support",
                  "Wildlife Protection",
                ].map((feature) => (
                  <div key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`feature-${feature}`}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`feature-${feature}`} className="ml-2 text-sm text-gray-700">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>

            <button className="w-full mt-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Apply Filters
            </button>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4">Search Results</h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search destinations, accommodations, or activities"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="eco-rating-high">Eco Rating: High to Low</option>
                  <option value="eco-rating-low">Eco Rating: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex border-b border-gray-200">
                <button className="px-4 py-2 font-medium text-green-600 border-b-2 border-green-600">
                  Destinations
                </button>
                <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">Accommodations</button>
                <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">Transport</button>
                <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">Activities</button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6">
                {dummyDestinations.slice(0, 5).map((destination) => (
                  <div
                    key={destination.id}
                    className="flex flex-col md:flex-row border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="relative h-48 md:h-auto md:w-64">
                      <Image
                        src={destination.image || "/placeholder.svg"}
                        alt={destination.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs font-medium rounded">
                        {destination.ecoRating}/5 Eco Rating
                      </div>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold mb-1">{destination.name}</h2>
                          <p className="text-gray-600 text-sm mb-2">{destination.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ${destination.priceRange.min} - ${destination.priceRange.max}
                          </p>
                          <p className="text-gray-500 text-sm">per person</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{destination.description}</p>
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
                                className={`h-5 w-5 ${star <= destination.ecoRating ? "text-yellow-400" : "text-gray-300"}`}
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
                        <Link
                          href={`/destinations/${destination.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
                  <button className="px-3 py-1 border-t border-b border-gray-300 text-gray-500 hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-1 border-t border-b border-gray-300 text-gray-500 hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
