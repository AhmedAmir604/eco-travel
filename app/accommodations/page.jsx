'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { Search, MapPin, Loader2, Star, Wifi, Car, Utensils, Dumbbell, Waves } from "lucide-react"

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchCity, setSearchCity] = useState('')
  const [searchRadius, setSearchRadius] = useState('25')
  const [error, setError] = useState('')
  const [searchInfo, setSearchInfo] = useState(null)

  const searchAccommodations = async (city, radius = searchRadius) => {
    if (!city.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/accommodations?city=${encodeURIComponent(city)}&radius=${radius}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch accommodations')
      }

      setAccommodations(result.data)
      setSearchInfo({
        city: result.city,
        checkIn: result.checkIn,
        checkOut: result.checkOut,
        count: result.data.length,
        radius: radius
      })
    } catch (err) {
      setError(err.message)
      setAccommodations([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    searchAccommodations(searchCity, searchRadius)
  }

  const getAmenityIcon = (amenity) => {
    const icons = {
      'Restaurant': <Utensils size={12} />,
      'WiFi': <Wifi size={12} />,
      'Fitness Center': <Dumbbell size={12} />,
      'Swimming Pool': <Waves size={12} />,
      'Parking': <Car size={12} />
    }
    return icons[amenity] || <Star size={12} />
  }

  // Load default results for popular eco destinations
  useEffect(() => {
    searchAccommodations('Paris')
  }, [])
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Eco-Friendly Accommodations</h1>
          <p className="text-gray-600 mb-6">
            Discover sustainable places to stay that minimize environmental impact while providing comfortable and
            memorable experiences. Search by city name to find eco-friendly hotels with precise Google Maps integration.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter a city name (e.g., Paris, London, New York, Tokyo)..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={searchCity}
              onChange={(e) => {
                setSearchCity(e.target.value)
                if (e.target.value) searchAccommodations(e.target.value, searchRadius)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Popular Cities</option>
              <option value="Paris">Paris</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
              <option value="Tokyo">Tokyo</option>
              <option value="Dubai">Dubai</option>
              <option value="Singapore">Singapore</option>
              <option value="Barcelona">Barcelona</option>
              <option value="Amsterdam">Amsterdam</option>
              <option value="Rome">Rome</option>
              <option value="Berlin">Berlin</option>
              <option value="Madrid">Madrid</option>
              <option value="Zurich">Zurich</option>
            </select>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="5">5 km radius</option>
              <option value="10">10 km radius</option>
              <option value="25">25 km radius</option>
              <option value="50">50 km radius</option>
              <option value="100">100 km radius</option>
            </select>
            <button
              type="submit"
              disabled={loading || !searchCity.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Search size={18} className="mr-2" />
              )}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchInfo && (
            <div className="mt-4 p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-700">
                Found {searchInfo.count} eco-friendly accommodations in <strong>{searchInfo.city}</strong>
                <span className="text-gray-600"> (within {searchInfo.radius} km radius)</span>
                {searchInfo.checkIn && (
                  <span> for {new Date(searchInfo.checkIn).toLocaleDateString()} - {new Date(searchInfo.checkOut).toLocaleDateString()}</span>
                )}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Finding eco-friendly accommodations...</span>
          </div>
        ) : accommodations.length === 0 && !error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a city or country name to search for eco-friendly accommodations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {accommodations.map((accommodation) => (
              <div key={accommodation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                  {/* Hotel Image */}
                  <div className="md:w-1/2">
                    <div className="relative h-64 md:h-full">
                      <Image
                        src={accommodation.image || "/placeholder.svg"}
                        alt={accommodation.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 text-sm font-medium rounded-full">
                        {accommodation.ecoRating}/5 Eco Rating
                      </div>
                      {accommodation.rating && (
                        <div className="absolute top-3 right-3 bg-white bg-opacity-90 text-gray-800 px-2 py-1 text-sm font-medium rounded-full flex items-center">
                          <Star size={12} className="text-yellow-400 mr-1" />
                          {accommodation.rating}/5
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hotel Details */}
                  <div className="md:w-1/2 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{accommodation.name}</h3>
                      {accommodation.chainCode && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {accommodation.chainCode}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <span>{accommodation.location}</span>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{accommodation.description}</p>

                    {/* Eco Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Eco-Friendly Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {accommodation.features.slice(0, 4).map((feature) => (
                          <span key={feature} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                        {accommodation.features.length > 4 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{accommodation.features.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {accommodation.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {getAmenityIcon(amenity)}
                            <span className="ml-1">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Distance */}
                    {accommodation.distance && (
                      <div className="mb-4">
                        <span className="text-xs text-gray-500">
                          📍 {accommodation.distance.value?.toFixed(1)} {accommodation.distance.unit} from search center
                        </span>
                      </div>
                    )}

                    {/* Booking Section */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="text-gray-500 text-sm">
                        Contact for pricing
                      </div>
                      <button
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(accommodation.name + ' ' + accommodation.location + ' booking')}`, '_blank')}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
