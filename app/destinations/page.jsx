'use client'

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, MapPin, Star, Loader2 } from "lucide-react"
import CitySearchInput from "@/components/CitySearchInput"
import LikeButton from "@/components/LikeButton"
import { useToast } from "@/contexts/ToastContext"
// ToastContainer is now global in layout
import Pagination from "@/components/Pagination"

export default function DestinationsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [resultsPerPage] = useState(6)
  const [searchInfo, setSearchInfo] = useState(null)

  // Handle URL parameters from home page search and load activities
  useEffect(() => {
    // setSelectedCity(null);
    const cityParam = searchParams.get('city')
    const travelersParam = searchParams.get('travelers')
    const datesParam = searchParams.get('dates')
    const checkInParam = searchParams.get('checkIn')
    const checkOutParam = searchParams.get('checkOut')
    const latitudeParam = searchParams.get('latitude')
    const longitudeParam = searchParams.get('longitude')
    
    if (cityParam) {
      // Set the city from URL parameter
      setSelectedCity(cityParam)
      
      // Store search info for display
      setSearchInfo({
        city: cityParam,
        travelers: travelersParam,
        dates: datesParam,
        checkIn: checkInParam,
        checkOut: checkOutParam
      })
      
      // Check if coordinates are provided from home page search
      const coordinates = latitudeParam && longitudeParam ? {
        latitude: parseFloat(latitudeParam),
        longitude: parseFloat(longitudeParam)
      } : null
      
      // Load activities for the searched city with coordinates if available
      loadActivitiesForCity(cityParam, coordinates)
      
      // Show welcome message
      // toast.success(`Searching for eco-friendly activities in ${cityParam}`)
    } 
  }, [searchParams])

  const loadActivitiesForCity = async (cityName, coordinates = null) => {
    if (!cityName) return
    
    setLoading(true)
    try {
      // Build API URL with coordinates if available
      let apiUrl = `/api/activities?city=${encodeURIComponent(cityName)}&radius=10`
      
      if (coordinates && coordinates.latitude && coordinates.longitude) {
        apiUrl += `&latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`
        //('Using coordinates from city suggestion:', coordinates)
      }
      
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      if (data.success) {
        setActivities(data.data || [])
        if (!data.fallback) {
          toast.success(`Found ${data.data.length} activities in ${cityName}`)
        } else {
          // toast.info(`Showing eco-friendly activities for ${cityName}`)
        }
      } else {
        // toast.error('Failed to load activities')
      }
    } catch (error) {
      // console.error('Error loading activities:', error)
      toast.error('Error loading activities. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCitySearch = () => {
    if (selectedCity.trim()) {
      setCurrentPage(1) // Reset to first page
      // When manually typing/searching, we don't have coordinates, so pass null
      loadActivitiesForCity(selectedCity, null)
    } else {
      toast.warning('Please select a city to search')
    }
  }

  // Use all activities for display
  const displayItems = activities
  
  // Pagination logic
  const totalPages = Math.ceil(displayItems.length / resultsPerPage)
  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = startIndex + resultsPerPage
  const currentItems = displayItems.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search Info Banner */}
        {searchInfo && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">🌍 Your Eco-Travel Search</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    <span className="font-medium">Destination:</span>
                    <span className="ml-1">{searchInfo.city}</span>
                  </div>
                  {searchInfo.travelers && (
                    <div className="flex items-center">
                      <span className="font-medium">Travelers:</span>
                      <span className="ml-1">{searchInfo.travelers}</span>
                    </div>
                  )}
                  {searchInfo.dates && (
                    <div className="flex items-center">
                      <span className="font-medium">Dates:</span>
                      <span className="ml-1">{searchInfo.dates}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSearchInfo(null)
                  router.replace('/destinations', { scroll: false })
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {searchInfo ? `Eco-Friendly Activities in ${searchInfo.city}` : 'Discover Eco-Friendly Activities'}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {searchInfo 
                ? `Discover sustainable activities and experiences in ${searchInfo.city} that support local communities and environmental conservation.`
                : 'Explore sustainable activities worldwide that prioritize environmental conservation, support local communities, and offer authentic experiences.'
              }
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <CitySearchInput
                placeholder="Search destinations..."
                initialValue={selectedCity}
                onCitySelect={(city) => {
                  const cityName = city.displayName || city.name
                  setSelectedCity(cityName)
                  toast.success(`Selected: ${cityName}`)
                  setCurrentPage(1)
                  
                  // Pass coordinates if available from city suggestion
                  const coordinates = city.latitude && city.longitude ? {
                    latitude: city.latitude,
                    longitude: city.longitude
                  } : null
                  
                  loadActivitiesForCity(cityName, coordinates)
                }}
                onInputChange={(value) => {
                  setSelectedCity(value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selectedCity) {
                    e.preventDefault()
                    handleCitySearch()
                  }
                }}
                showPopularCities={true}
                className="w-full"
                inputClassName="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                dropdownClassName="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
              />
            </div>
            
            <button 
              onClick={handleCitySearch}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 font-medium"
            >
              {loading ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Search size={18} className="mr-2" />
              )}
              Search Activities
            </button>
            
            {searchInfo && (
              <button
                onClick={() => {
                  setActivities([])
                  setSelectedCity('')
                  setSearchInfo(null)
                  setCurrentPage(1)
                  router.replace('/destinations', { scroll: false })
                  toast.info('Starting new search')
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center font-medium"
              >
                🔄 New Search
              </button>
            )}
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sustainable Experiences
              </h2>
              <p className="text-gray-600">
                {loading ? 'Searching for activities...' : `${displayItems.length} eco-friendly activities found`}
                {selectedCity && ` in ${selectedCity}`}
              </p>
            </div>
            {displayItems.length > 0 && !loading && (
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Eco-Certified Activities
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">Finding eco-friendly activities...</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((item) => (
              <div key={item.id} className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                  <div className="relative h-56 w-full">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Like Button */}
                    <div className="absolute top-4 right-4 z-10">
                      <LikeButton 
                        activity={item}
                        size="md"
                        variant="default"
                      />
                    </div>
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 shadow-sm">
                      {item.price ? `${item.price.amount} ${item.price.currency}` : 'Free'}
                    </div>
                    
                    {/* Live Data Badge */}
                    {item.isRealData && (
                      <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Live Data
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin size={16} className="mr-2 text-green-500" />
                      <span className="text-sm">{item.location}</span>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">{item.description}</p>
                    
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        {item.rating ? (
                          <div className="flex items-center">
                            <Star size={16} className="text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-semibold text-gray-900">{item.rating}</span>
                            <span className="text-xs text-gray-500 ml-1">rating</span>
                          </div>
                        ) : (
                          <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                            Eco Activity
                          </span>
                        )}
                      </div>
                      
                      <Link
                        href={`/activities/${item.id}`}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayItems.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No activities found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any eco-friendly activities for your search. Try exploring a different destination or check back later for new additions.
              </p>
              <button
                onClick={() => {
                  setSelectedCity('')
                  setSearchInfo(null)
                  setCurrentPage(1)
                  loadActivitiesForCity('Paris', null)
                  toast.info('Showing popular destinations')
                }}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Explore Popular Destinations
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && displayItems.length > 0 && totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={displayItems.length}
              itemsPerPage={resultsPerPage}
              onPageChange={handlePageChange}
              className="flex justify-center"
            />
          </div>
        )}
      </div>
      
      {/* Toast Container is now global in layout */}
    </main>
  )
}
