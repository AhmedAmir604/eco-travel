'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { dummyDestinations } from "@/data/dummy-data"
import Image from "next/image"
import Link from "next/link"
import { Filter, Search, Loader2, MapPin, Calendar, Users, Leaf, Star } from "lucide-react"
import { useToast } from "@/hooks/useToast"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("destinations")
  const [generatedItineraries, setGeneratedItineraries] = useState([])
  const [showItineraries, setShowItineraries] = useState(false)

  // Get search parameters from URL
  useEffect(() => {
    const destination = searchParams.get('destination')
    const travelers = searchParams.get('travelers')

    if (destination) {
      setSearchQuery(destination)
      // Auto-generate itinerary if we have search params
      generateItineraryFromParams(destination, travelers)
    }
  }, [searchParams])

  const generateItineraryFromParams = async (destination, travelers = "2") => {
    setLoading(true)
    setShowItineraries(true)
    setActiveTab("itineraries")

    try {
      const response = await fetch('/api/itinerary-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination,
          duration: 3,
          travelers: parseInt(travelers) || 2,
          interests: ['culture', 'nature'],
          budget: 'medium',
          accommodationType: 'eco-hotel',
          transportPreference: 'public',
          sustainabilityLevel: 'high'
        })
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedItineraries([result.data])
        toast.success(`Generated eco-friendly itinerary for ${destination}!`)
      } else {
        toast.error(result.error || 'Failed to generate itinerary')
        setShowItineraries(false)
        setActiveTab("destinations")
      }
    } catch (error) {
      console.error('Error generating itinerary:', error)
      toast.error('Failed to generate itinerary. Please try again.')
      setShowItineraries(false)
      setActiveTab("destinations")
    } finally {
      setLoading(false)
    }
  }

  const generateItineraryForDestination = async (destination) => {
    setLoading(true)
    setShowItineraries(true)
    setActiveTab("itineraries")

    try {
      const response = await fetch('/api/itinerary-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination.name,
          duration: 3,
          travelers: 2,
          interests: destination.tags || ['culture', 'nature'],
          budget: 'medium',
          accommodationType: 'eco-hotel',
          transportPreference: 'public',
          sustainabilityLevel: 'high'
        })
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedItineraries([result.data])
        toast.success(`Generated eco-friendly itinerary for ${destination.name}!`)
      } else {
        toast.error(result.error || 'Failed to generate itinerary')
        setShowItineraries(false)
        setActiveTab("destinations")
      }
    } catch (error) {
      console.error('Error generating itinerary:', error)
      toast.error('Failed to generate itinerary. Please try again.')
      setShowItineraries(false)
      setActiveTab("destinations")
    } finally {
      setLoading(false)
    }
  }

  const viewItineraryDetails = (itinerary) => {
    const itineraryId = itinerary.id
    sessionStorage.setItem(`itinerary-${itineraryId}`, JSON.stringify(itinerary))
    router.push(`/itineraries/${itineraryId}`)
  }
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                <button
                  onClick={() => setActiveTab("destinations")}
                  className={`px-4 py-2 font-medium ${activeTab === "destinations" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Destinations
                </button>
                {showItineraries && (
                  <button
                    onClick={() => setActiveTab("itineraries")}
                    className={`px-4 py-2 font-medium ${activeTab === "itineraries" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Generated Itineraries
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("accommodations")}
                  className={`px-4 py-2 font-medium ${activeTab === "accommodations" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Accommodations
                </button>
                <button
                  onClick={() => setActiveTab("transport")}
                  className={`px-4 py-2 font-medium ${activeTab === "transport" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Transport
                </button>
                <button
                  onClick={() => setActiveTab("activities")}
                  className={`px-4 py-2 font-medium ${activeTab === "activities" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Activities
                </button>
              </div>

              <div className="mt-6">
                {/* Loading State */}
                {loading && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center">
                      <Loader2 className="animate-spin mr-2 text-green-600" size={24} />
                      <span className="text-lg font-medium text-gray-700">Generating your eco-friendly itinerary...</span>
                    </div>
                  </div>
                )}

                {/* Destinations Tab */}
                {activeTab === "destinations" && !loading && (
                  <div className="grid grid-cols-1 gap-6">
                    {dummyDestinations
                      .filter(destination =>
                        searchQuery === "" ||
                        destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        destination.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .slice(0, 5)
                      .map((destination) => (
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
                              <div className="flex gap-2">
                                <Link
                                  href={`/destinations/${destination.id}`}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                  View Details
                                </Link>
                                <button
                                  onClick={() => generateItineraryForDestination(destination)}
                                  disabled={loading}
                                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                  <Search size={16} />
                                  Generate Itinerary
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Generated Itineraries Tab */}
                {activeTab === "itineraries" && !loading && (
                  <div className="grid grid-cols-1 gap-6">
                    {generatedItineraries.map((itinerary) => (
                      <div
                        key={itinerary.id}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 mb-2">{itinerary.title}</h2>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin size={16} />
                                  <span>{itinerary.destination}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar size={16} />
                                  <span>{itinerary.duration} days</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users size={16} />
                                  <span>{itinerary.travelers} travelers</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Leaf size={16} />
                                  <span>Eco Score: {itinerary.sustainability?.ecoScore || 4.5}/5</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600 mb-1">
                                {Math.round(itinerary.sustainability?.totalCarbonSaved || 0)}kg
                              </div>
                              <div className="text-sm text-gray-600">CO₂ Saved</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg">
                              <div className="text-lg font-semibold text-gray-900 mb-1">
                                {itinerary.days?.length || 0} Days
                              </div>
                              <div className="text-sm text-gray-600">Planned Activities</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <div className="text-lg font-semibold text-gray-900 mb-1">
                                {itinerary.accommodations?.length || 0} Hotels
                              </div>
                              <div className="text-sm text-gray-600">Eco-Friendly Stays</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <div className="text-lg font-semibold text-gray-900 mb-1">
                                {itinerary.transport?.length || 0} Transport
                              </div>
                              <div className="text-sm text-gray-600">Sustainable Options</div>
                            </div>
                          </div>

                          {/* Sample Activities Preview */}
                          {itinerary.days && itinerary.days.length > 0 && (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Sample Activities</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {itinerary.days.slice(0, 2).map((day, index) => (
                                  <div key={index} className="bg-white p-4 rounded-lg">
                                    <div className="font-medium text-gray-900 mb-2">
                                      Day {day.day}: {day.theme}
                                    </div>
                                    <div className="space-y-2">
                                      {day.activities?.slice(0, 2).map((activity, actIndex) => (
                                        <div key={actIndex} className="flex items-center gap-2 text-sm">
                                          <span className="text-green-600 font-medium">{activity.time}</span>
                                          <span className="text-gray-700">{activity.title}</span>
                                        </div>
                                      ))}
                                      {day.activities?.length > 2 && (
                                        <div className="text-xs text-gray-500">
                                          +{day.activities.length - 2} more activities
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={16}
                                      className={`${star <= (itinerary.sustainability?.ecoScore || 4.5) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-600">Eco-Friendly Rating</span>
                              </div>
                              <div className="text-sm text-green-700 font-medium">
                                {Math.round(itinerary.sustainability?.sustainabilityPercentage || 85)}% Sustainable
                              </div>
                            </div>
                            <button
                              onClick={() => viewItineraryDetails(itinerary)}
                              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              View Full Itinerary
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Other Tabs */}
                {activeTab === "accommodations" && !loading && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Find Eco-Friendly Accommodations</h3>
                    <p className="text-gray-600 mb-6">Discover sustainable hotels and lodges that prioritize environmental responsibility.</p>
                    <Link
                      href="/accommodations"
                      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Browse Accommodations
                    </Link>
                  </div>
                )}

                {activeTab === "transport" && !loading && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Discover Sustainable Transport</h3>
                    <p className="text-gray-600 mb-6">Find eco-friendly transport options including public transit, bike sharing, and electric vehicle charging.</p>
                    <Link
                      href="/transport"
                      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Explore Transport Options
                    </Link>
                  </div>
                )}

                {activeTab === "activities" && !loading && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Eco-Friendly Activities</h3>
                    <p className="text-gray-600 mb-6">Discover sustainable activities and experiences that support local communities and protect the environment.</p>
                    <Link
                      href="/itineraries"
                      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      View Sample Itineraries
                    </Link>
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
