'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dummyTransportOptions } from "@/data/dummy-data"
import { Search, MapPin, Leaf, Star, Info, ExternalLink } from "lucide-react"
import { getTransportImage, getTransportImageAlt } from "@/lib/transport-images"
import { TransportGridSkeleton } from "@/components/LoadingSkeleton"

export default function TransportPage() {
  const router = useRouter()
  const [transportOptions, setTransportOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDestination, setSelectedDestination] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [location, setLocation] = useState("")
  const [areaData, setAreaData] = useState(null)
  const [summaryData, setSummaryData] = useState(null)

  // useEffect(() => {
  //   setTransportOptions(dummyTransportOptions)
  // }, [])

  // 🚀 OPTIMIZATION: Add debouncing to prevent too many API calls
  const [debounceTimer, setDebounceTimer] = useState(null)

  // Discover transport methods in area with debouncing
  const discoverAreaTransport = async (immediate = false) => {
    if (!location) {
      alert('Please enter a location')
      return
    }

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // If not immediate, debounce the request
    if (!immediate) {
      const timer = setTimeout(() => {
        performSearch()
      }, 500) // 500ms debounce
      setDebounceTimer(timer)
      return
    }

    performSearch()
  }

  const performSearch = async () => {
    setLoading(true)
    setSummaryData(null)
    setAreaData(null)

    try {
      const requestType = selectedType === 'summary' ? 'summary' :
        selectedType === 'discover' || !selectedType ? 'discover' : 'details'

      console.log(`🔍 Discovering transport in "${location}" with type: ${requestType}`)
      const startTime = performance.now() // Performance monitoring

      const response = await fetch('/api/transport-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location.trim(),
          type: requestType,
          transportType: selectedType && selectedType !== 'discover' && selectedType !== 'summary' ? selectedType : undefined,
          radius: 5000 // 5km radius
        })
      })

      const result = await response.json()
      const endTime = performance.now()
      console.log(`⚡ API Response received in ${Math.round(endTime - startTime)}ms:`, result)

      if (result.success) {
        if (requestType === 'summary') {
          setSummaryData(result.data)
          setTransportOptions([]) // Clear transport options when showing summary
        } else if (requestType === 'details') {
          // Handle single transport type details
          const detailsTransport = [{
            id: `details-${result.data.type}`,
            name: result.data.name,
            type: result.data.type,
            description: result.data.description,
            image: getTransportImage(result.data.type, 'small', result.data.places),
            carbonRating: result.data.ecoScore,
            price: estimateTransportPrice(result.data.type),
            carbonEmission: result.data.carbonFactor,
            count: result.data.totalCount,
            icon: result.data.icon,
            availability: `${result.data.totalCount} locations found`,
            places: result.data.places,
            realTime: true,
            areaTransport: true,
            ecoImpact: result.data.ecoImpact,
            recommendations: result.data.recommendations
          }]

          setTransportOptions(detailsTransport)
          setAreaData([result.data])
        } else {
          // Handle discovered transport options
          if (result.data && result.data.length > 0) {
            const discoveredTransport = result.data.map((transport, index) => ({
              id: `area-${transport.type}-${index}`,
              name: transport.name,
              type: transport.type,
              description: transport.description,
              image: getTransportImage(transport.type, 'small', transport.places),
              carbonRating: transport.ecoScore,
              price: estimateTransportPrice(transport.type),
              carbonEmission: transport.carbonFactor,
              count: transport.count,
              icon: transport.icon,
              availability: transport.availability,
              places: transport.places || [],
              realTime: true,
              areaTransport: true,
              hasRealData: transport.places && transport.places.length > 0,
              hasGooglePhotos: transport.places && transport.places.some(p => p.photos && p.photos.length > 0)
            }))

            // console.log('✅ Processed transport options:', discoveredTransport.length)
            setTransportOptions(discoveredTransport)
            setAreaData(result.data)
          } else {
            // console.log('❌ No transport data received')
            setTransportOptions([])
            alert('No transport options found in this area. Try a different location or check your Google Maps API key.')
          }
        }
      } else {
        console.error('❌ API Error:', result.error)
        alert(`Failed to discover transport options: ${result.error}`)
      }
    } catch (error) {
      console.error('💥 Error discovering transport:', error)
      alert('Error discovering transport options. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get area transport summary
  const getAreaSummary = async () => {
    if (!location) {
      alert('Please enter a location')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/transport-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location.trim(),
          type: 'summary',
          radius: 5000
        })
      })

      const result = await response.json()
      if (result.success) {
        setSummaryData(result.data)
        setAreaData(null)
        setTransportOptions([]) // Clear transport options when showing summary
      }
    } catch (error) {
      console.error('Error getting area summary:', error)
      alert('Error getting area summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Navigation to transport detail page
  const navigateToTransportDetail = (transport) => {
    // Store transport data in localStorage for the detail page
    localStorage.setItem('selectedTransport', JSON.stringify(transport))

    // Navigate to detail page
    const transportId = transport.id || `${transport.type}-${Date.now()}`
    router.push(`/transport/${transportId}`)
  }

  const estimateTransportPrice = (type) => {
    const prices = {
      walking: 0,
      cycling_routes: 0,
      bicycle_store: 15, // Bike rental
      transit_station: 3,
      train_station: 8,
      subway_station: 3,
      bus_station: 2,
      electric_vehicle_charging_station: 25
    }
    return prices[type] || 5
  }

  const getTransportIcon = (type) => {
    const icons = {
      walking: '🚶',
      cycling_routes: '🚴',
      bicycle_store: '🚴',
      transit_station: '🚌',
      train_station: '🚂',
      subway_station: '🚇',
      bus_station: '🚌',
      electric_vehicle_charging_station: '⚡',
      taxi_stand: '🚕'
    }
    return icons[type] || '🚗'
  }

  // Filter transport options
  const filteredOptions = transportOptions.filter(transport => {
    const matchesSearch = transport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDestination = !selectedDestination || transport.destination === selectedDestination
    const matchesType = !selectedType || transport.type.toLowerCase().includes(selectedType.toLowerCase())

    return matchesSearch && matchesDestination && matchesType
  })

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">🌱 Low-Carbon Transport Finder</h1>
          <p className="text-gray-600 mb-6">
            Discover available eco-friendly transport methods in any area - from bike sharing to public transit, walking paths to electric vehicle charging.
          </p>

          {/* Area Transport Discovery */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 text-green-600" size={20} />
              Find Low-Carbon Transport in Area
              <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                5km radius
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative md:col-span-2">
                <input
                  type="text"
                  placeholder="Enter location (e.g., Manhattan, NYC or Costa Rica)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Transport Types</option>
                <option value="discover">🔍 Discover All</option>
                <option value="summary">📊 Area Summary</option>
                <option value="bicycle_store">🚴 Bike Rentals</option>
                <option value="transit_station">🚌 Public Transit</option>
                <option value="train_station">🚂 Train Stations</option>
                <option value="electric_vehicle_charging_station">⚡ EV Charging</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => discoverAreaTransport(true)}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Leaf className="animate-spin mr-2" size={18} />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Search className="mr-2" size={18} />
                    Discover Transport
                  </>
                )}
              </button>
              <button
                onClick={getAreaSummary}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Star className="mr-2" size={18} />
                Area Summary
              </button>
            </div>
          </div>

          {/* Traditional Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search transport options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Destinations</option>
              <option value="costa-rica">Costa Rica</option>
              <option value="iceland">Iceland</option>
              <option value="new-zealand">New Zealand</option>
              <option value="bhutan">Bhutan</option>
            </select>
          </div>
        </div>

        {/* Area Summary Display */}
        {summaryData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Star className="mr-2 text-blue-600" size={20} />
              Transport Summary for {summaryData.location}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{summaryData.totalTransportTypes}</div>
                <div className="text-sm text-gray-600">Transport Types</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{summaryData.ecoFriendlyOptions}</div>
                <div className="text-sm text-gray-600">Eco-Friendly Options</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{summaryData.zeroEmissionOptions}</div>
                <div className="text-sm text-gray-600">Zero Emission</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{summaryData.radius}</div>
                <div className="text-sm text-gray-600">Search Radius</div>
              </div>
            </div>

            {summaryData.recommendations && summaryData.recommendations.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Area Recommendations:</h3>
                <div className="space-y-2">
                  {summaryData.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-center text-sm text-green-700 bg-green-50 p-2 rounded">
                      <Info size={16} className="mr-2" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summaryData.bestOptions && (
              <div>
                <h3 className="font-semibold mb-3">Top Eco-Friendly Options:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {summaryData.bestOptions.map((option, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">{option.icon}</span>
                        <span className="font-medium">{option.name}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{option.description}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {'⭐'.repeat(option.ecoScore)} Eco Rating
                        </span>
                        <span className="text-xs text-gray-500">{option.count} available</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State with Skeleton */}
        {loading && (
          <>
            <div className="text-center py-4 mb-6">
              <div className="inline-flex items-center">
                <Leaf className="animate-spin mr-2 text-green-600" size={20} />
                <div>
                  <div className="font-medium">Discovering eco-friendly transport options...</div>
                  <div className="text-sm text-gray-500 mt-1">Searching Google Maps for real-time data</div>
                </div>
              </div>
            </div>
            <TransportGridSkeleton count={6} />
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOptions.map((transport) => (
            <div
              key={transport.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform"
              onClick={() => navigateToTransportDetail(transport)}
            >
              <div className="relative h-48">
                <Image
                  src={transport.image || getTransportImage(transport.type, 'small')}
                  alt={getTransportImageAlt(transport.type)}
                  fill
                  className="object-cover"
                  priority={false}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs font-medium rounded">
                  {'⭐'.repeat(transport.carbonRating)} Eco Rating
                </div>
                {transport.carbonEmission === 0 && (
                  <div className="absolute top-2 right-2 bg-green-800 text-white px-2 py-1 text-xs font-medium rounded">
                    🌱 Zero Emissions
                  </div>
                )}
                {transport.areaTransport && (
                  <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs font-medium rounded">
                    📍 Area Discovery
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded flex items-center">
                  <ExternalLink size={12} className="mr-1" />
                  View Details
                </div>
                {transport.hasGooglePhotos && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 text-xs font-medium rounded flex items-center">
                    📸 Real Photo
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{transport.icon || getTransportIcon(transport.type)}</span>
                  <h3 className="text-lg font-semibold">{transport.name}</h3>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Type: {transport.type.charAt(0).toUpperCase() + transport.type.slice(1).replace('_', ' ')}
                </div>
                <p className="text-gray-700 text-sm mb-4">{transport.description}</p>

                {/* Area transport details */}
                {transport.areaTransport && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {transport.availability}
                      </span>
                      <span className="flex items-center font-medium">
                        {typeof transport.count === 'number' ? `${transport.count} found` : transport.count}
                      </span>
                    </div>
                    {transport.hasRealData && (
                      <div className="text-xs text-green-600 font-medium">
                        ✅ Real-time data from Google Maps
                      </div>
                    )}
                    {transport.hasGooglePhotos && (
                      <div className="text-xs text-blue-600 font-medium">
                        📸 Real photos from Google Places
                      </div>
                    )}
                    {transport.ecoImpact && (
                      <div className="text-xs text-gray-600 mt-1">
                        💡 {transport.ecoImpact}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-green-600 font-bold">
                    ${transport.price} <span className="text-gray-500 font-normal text-sm">
                      {transport.price === 0 ? 'Free!' : 'est.'}
                    </span>
                  </div>
                  <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    CO₂: {transport.carbonEmission} kg/km
                  </div>
                </div>

                {/* Click to view more indicator */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800">
                    <ExternalLink size={14} className="mr-1" />
                    Click to view detailed information
                  </div>
                </div>

                {/* Show nearby places for area transport */}
                {transport.places && transport.places.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-green-600 font-medium flex items-center">
                        <MapPin size={14} className="mr-1" />
                        View Nearby Locations ({transport.places.length})
                      </summary>
                      <div className="mt-3 space-y-2">
                        {transport.places.slice(0, 5).map((place, index) => (
                          <div key={place.placeId || index} className="bg-white p-2 rounded border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm text-gray-800">{place.name}</span>
                              {place.rating !== 'N/A' && (
                                <span className="text-yellow-600 text-xs flex items-center">
                                  ⭐ {place.rating}
                                  {place.userRatingsTotal > 0 && (
                                    <span className="text-gray-500 ml-1">({place.userRatingsTotal})</span>
                                  )}
                                </span>
                              )}
                            </div>
                            {place.vicinity && (
                              <div className="text-xs text-gray-600">{place.vicinity}</div>
                            )}
                            <div className="flex items-center justify-between mt-1">
                              {place.openNow !== undefined && (
                                <span className={`text-xs px-2 py-1 rounded ${place.openNow ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                  {place.openNow ? 'Open Now' : 'Closed'}
                                </span>
                              )}
                              {place.priceLevel && (
                                <span className="text-xs text-gray-500">
                                  {'$'.repeat(place.priceLevel)} Price Level
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {transport.places.length > 5 && (
                          <div className="text-xs text-gray-500 text-center py-2">
                            +{transport.places.length - 5} more locations available...
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOptions.length === 0 && !loading && !summaryData && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No transport options found</p>
              <p className="text-sm mb-4">Try discovering transport methods in a specific area above</p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Tips for better results:</h4>
                <ul className="text-sm text-yellow-700 text-left space-y-1">
                  <li>• Try major cities like "New York, NY" or "London, UK"</li>
                  <li>• Use specific addresses like "Times Square, NYC"</li>
                  <li>• Check that your Google Maps API key is configured</li>
                  <li>• Try different transport types from the dropdown</li>
                </ul>
              </div>
            </div>
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
            <button className="px-3 py-1 border border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      </div>
    </main>
  )
}