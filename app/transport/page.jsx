'use client'

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Leaf, Star, ExternalLink, Filter, Globe } from "lucide-react"
import { getTransportImage, getTransportImageAlt } from "@/lib/transport-images"
import { useToast } from "@/hooks/useToast"
import ToastContainer from "@/components/ToastContainer"
import CitySearchInput from "@/components/CitySearchInput"
import Pagination from "@/components/Pagination"

export default function TransportPage() {
  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()
  const [transportOptions, setTransportOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDestination, setSelectedDestination] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [location, setLocation] = useState("")
  const [summaryData, setSummaryData] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [resultsPerPage] = useState(4)
  const [paginationLoading, setPaginationLoading] = useState(false)

  const [debounceTimer, setDebounceTimer] = useState(null)

  // Discover transport methods in area with debouncing
  const discoverAreaTransport = async (immediate = false) => {
    if (!location) {
      toast.warning('Please enter a location')
      return
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (!immediate) {
      const timer = setTimeout(() => {
        performSearch()
      }, 500)
      setDebounceTimer(timer)
      return
    }

    performSearch()
  }

  const performSearch = async () => {
    setLoading(true)
    setSummaryData(null)
    resetPagination() // Reset to first page on new search

    try {
      const requestType = selectedType === 'summary' ? 'summary' :
        selectedType === 'discover' || !selectedType ? 'discover' : 'details'

      const response = await fetch('/api/transport-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location.trim(),
          type: requestType,
          transportType: selectedType && selectedType !== 'discover' && selectedType !== 'summary' ? selectedType : undefined,
          radius: 5000
        })
      })

      const result = await response.json()

      if (result.success) {
        if (requestType === 'summary') {
          setSummaryData(result.data)
          setTransportOptions([])
        } else if (requestType === 'details') {
          const detailsTransport = [{
            id: `details-${result.data.type}`,
            name: result.data.name,
            type: result.data.type,
            description: result.data.description,
            image: getTransportImage(result.data.type, 'small', result.data.places),
            carbonRating: result.data.ecoScore,
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
        } else {
          if (result.data && result.data.length > 0) {
            const discoveredTransport = result.data.map((transport, index) => ({
              id: `area-${transport.type}-${index}`,
              name: transport.name,
              type: transport.type,
              description: transport.description,
              image: getTransportImage(transport.type, 'small', transport.places),
              carbonRating: transport.ecoScore,
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

            setTransportOptions(discoveredTransport)
            toast.success(`Found ${discoveredTransport.length} transport options in ${location}`)
          } else {
            setTransportOptions([])
            toast.warning('No transport options found in this area.')
          }
        }
      } else {
        toast.error(`Failed to discover transport options: ${result.error}`)
      }
    } catch (error) {
      toast.error('Error discovering transport options. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getAreaSummary = async () => {
    if (!location) {
      toast.warning('Please enter a location')
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
        setTransportOptions([])
        toast.success(`Generated transport summary for ${location}`)
      }
    } catch (error) {
      toast.error('Error getting area summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const navigateToTransportDetail = (transport) => {
    localStorage.setItem('selectedTransport', JSON.stringify(transport))
    const transportId = transport.id || `${transport.type}-${Date.now()}`
    router.push(`/transport/${transportId}`)
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

  const getEcoPreference = (transport) => {
    const carbonEmission = transport.carbonEmission || 0
    const ecoScore = transport.carbonRating || 3
    
    // Calculate eco preference based on carbon emissions and eco score
    if (carbonEmission === 0 && ecoScore >= 4) {
      return {
        level: 'excellent',
        label: 'Most Eco-Friendly',
        message: 'Zero emissions - Perfect for the environment!',
        bgColor: 'bg-green-600',
        textColor: 'text-white',
        borderColor: 'border-green-500',
        icon: '🌟'
      }
    } else if (carbonEmission <= 0.05 && ecoScore >= 4) {
      return {
        level: 'very-good',
        label: 'Highly Eco-Friendly',
        message: 'Ultra-low emissions - Excellent choice!',
        bgColor: 'bg-emerald-500',
        textColor: 'text-white',
        borderColor: 'border-emerald-400',
        icon: '✨'
      }
    } else if (carbonEmission <= 0.1 && ecoScore >= 3) {
      return {
        level: 'good',
        label: 'Eco-Friendly',
        message: 'Low emissions - Great for sustainable travel!',
        bgColor: 'bg-green-500',
        textColor: 'text-white',
        borderColor: 'border-green-400',
        icon: '🌱'
      }
    } else if (carbonEmission <= 0.2) {
      return {
        level: 'moderate',
        label: 'Moderately Eco-Friendly',
        message: 'Moderate emissions - Good shared transport option!',
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
        borderColor: 'border-yellow-400',
        icon: '⚡'
      }
    } else {
      return {
        level: 'limited',
        label: 'Limited Eco-Friendliness',
        message: 'Higher emissions - Consider alternatives when possible.',
        bgColor: 'bg-orange-500',
        textColor: 'text-white',
        borderColor: 'border-orange-400',
        icon: '⚠️'
      }
    }
  }

  // Filter transport options
  const filteredOptions = transportOptions.filter(transport => {
    const matchesSearch = transport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDestination = !selectedDestination || transport.destination === selectedDestination
    const matchesType = !selectedType || transport.type.toLowerCase().includes(selectedType.toLowerCase())

    return matchesSearch && matchesDestination && matchesType
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredOptions.length / resultsPerPage)
  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = startIndex + resultsPerPage
  const currentTransportOptions = filteredOptions.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setPaginationLoading(true)
    setCurrentPage(page)
    // Scroll to transport results section
    window.scrollTo({ top: 800, behavior: 'smooth' })
    // Remove loading state after scroll animation
    setTimeout(() => setPaginationLoading(false), 300)
  }

  // Reset pagination when transport options change
  const resetPagination = () => {
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Leaf size={32} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sustainable Transport Finder
            </h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Discover eco-friendly transport options in any location. From zero-emission cycling to efficient public transit.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-12">
          <div className="max-w-4xl mx-auto">
            {/* Main Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <CitySearchInput
                  placeholder="Enter location (e.g., Manhattan, NYC, London, Paris)..."
                  initialValue={location}
                  onCitySelect={(city) => {
                    // Extract the best location name for transport search
                    const cityName = city.name || city.displayName?.split(',')[0] || '';
                    const locationString = city.displayName || city.name || '';
                    
                    setLocation(locationString);
                    
                    // Show success notification
                    toast.success(`Selected: ${city.displayName}`);
                    
                    // Auto-discover transport when city is selected
                    if (locationString) {
                      // Clear any existing timer
                      if (debounceTimer) {
                        clearTimeout(debounceTimer);
                        setDebounceTimer(null);
                      }
                      // Trigger immediate search
                      setTimeout(() => {
                        discoverAreaTransport(true);
                      }, 100); // Small delay to ensure UI updates
                    }
                  }}
                  onInputChange={(value) => {
                    setLocation(value);
                    // Only update the location state, don't trigger search while typing
                  }}
                  onKeyDown={(e) => {
                    // Allow manual search when Enter is pressed
                    if (e.key === 'Enter' && location && location.length >= 2) {
                      e.preventDefault();
                      discoverAreaTransport(true);
                    }
                  }}
                  disabled={loading}
                  showPopularCities={true}
                  className="w-full"
                  inputClassName="w-full pl-12 pr-12 py-4 bg-white/90 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  dropdownClassName="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-sm border border-emerald-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                />
              </div>
              <button
                onClick={() => discoverAreaTransport(true)}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 font-medium shadow-lg"
              >
                {loading ? (
                  <>
                    <Leaf className="animate-spin" size={20} />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Discover Transport
                  </>
                )}
              </button>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <Filter size={16} />
                <span className="text-sm font-medium">
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </span>
              </button>
              
              <button
                onClick={getAreaSummary}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors text-sm"
              >
                <Star size={16} />
                Area Summary
              </button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-emerald-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transport Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-4 py-3 bg-white/90 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">All Transport Types</option>
                      <option value="discover">🔍 Discover All</option>
                      <option value="summary">📊 Area Summary</option>
                      <option value="transit_station">🚌 Public Transit</option>
                      <option value="train_station">🚂 Train Stations</option>
                      <option value="electric_vehicle_charging_station">⚡ EV Charging</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Results</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Filter results..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/90 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Area Summary */}
        {summaryData && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Globe size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Transport Summary</h2>
                <p className="text-gray-600">{summaryData.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                <div className="text-3xl font-bold text-emerald-600 mb-1">{summaryData.totalTransportTypes}</div>
                <div className="text-sm text-gray-600">Transport Types</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-1">{summaryData.ecoFriendlyOptions}</div>
                <div className="text-sm text-gray-600">Eco-Friendly</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-1">{summaryData.zeroEmissionOptions}</div>
                <div className="text-sm text-gray-600">Zero Emission</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl">
                <div className="text-3xl font-bold text-teal-600 mb-1">{summaryData.radius}</div>
                <div className="text-sm text-gray-600">Search Radius</div>
              </div>
            </div>

            {summaryData.bestOptions && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Eco-Friendly Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {summaryData.bestOptions.map((option, index) => (
                    <div key={index} className="p-4 bg-white/60 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{option.icon}</span>
                        <span className="font-medium text-gray-800">{option.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex">
                          {[...Array(option.ecoScore)].map((_, i) => (
                            <Star key={i} size={14} className="text-emerald-500 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{option.count} available</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Leaf className="animate-spin text-emerald-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Discovering Transport Options</h3>
            <p className="text-gray-600">Searching for eco-friendly transport in your area...</p>
          </div>
        )}

        {/* Transport Options Grid */}
        {filteredOptions.length > 0 && (
          <div className={`transition-opacity duration-300 ${paginationLoading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Transport Options
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({filteredOptions.length} found)
                </span>
              </h2>
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {currentTransportOptions.map((transport) => {
                const ecoPreference = getEcoPreference(transport)
                return (
                  <div
                    key={transport.id}
                    onClick={() => navigateToTransportDetail(transport)}
                    className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 ${ecoPreference.borderColor} overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer relative`}
                  >
                    {/* Eco Preference Banner */}
                    <div className={`${ecoPreference.bgColor} ${ecoPreference.textColor} px-4 py-2 text-center text-sm font-medium`}>
                      <div className="flex items-center justify-center gap-2">
                        <span>{ecoPreference.icon}</span>
                        <span>{ecoPreference.label}</span>
                      </div>
                    </div>

                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={transport.image || getTransportImage(transport.type, 'small')}
                        alt={getTransportImageAlt(transport.type)}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Overlay badges */}
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-medium">
                          {[...Array(transport.carbonRating)].map((_, i) => (
                            <Star key={i} size={12} className="fill-current" />
                          ))}
                        </div>
                      </div>
                      
                      {transport.carbonEmission === 0 && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                          🌱 Zero Emissions
                        </div>
                      )}
                      
                      <div className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-full">
                        <ExternalLink size={16} />
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{transport.icon || getTransportIcon(transport.type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{transport.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {transport.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{transport.description}</p>

                      {/* Eco Preference Message */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="text-sm text-green-800 font-medium mb-1">
                          {ecoPreference.icon} {ecoPreference.message}
                        </div>
                      </div>

                      {transport.areaTransport && (
                        <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="flex items-center gap-1 text-emerald-700">
                              <MapPin size={14} />
                              {transport.availability}
                            </span>
                            <span className="font-medium text-emerald-800">
                              {typeof transport.count === 'number' ? `${transport.count} found` : transport.count}
                            </span>
                          </div>
                          
                          {transport.hasRealData && (
                            <div className="text-xs text-emerald-600 font-medium">
                              ✅ Real-time data
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {transport.carbonEmission} kg CO₂/km
                        </div>
                        <div className="text-emerald-600 hover:text-emerald-700 transition-colors">
                          <span className="text-sm font-medium">View Details →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOptions.length}
              itemsPerPage={resultsPerPage}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          </div>
        )}

        {/* Empty State */}
        {filteredOptions.length === 0 && !loading && !summaryData && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
              <Search size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Discover Eco-Friendly Transport</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Enter a location above to find sustainable transport options in any area around the world.
            </p>
            
            <div className="bg-white/60 rounded-xl p-6 max-w-md mx-auto border border-emerald-100">
              <h4 className="font-medium text-emerald-800 mb-3">💡 Try searching for:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div>• Major cities: "New York, NY" or "London, UK"</div>
                <div>• Specific areas: "Times Square, NYC"</div>
                <div>• Neighborhoods: "Manhattan" or "Soho"</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}