'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, MapPin, Star, Clock, Phone, Globe, Navigation, Leaf, Info, Camera } from 'lucide-react'
import { getTransportImage, getTransportImages } from '@/lib/transport-images'

export default function TransportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [transport, setTransport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [transportImages, setTransportImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    // Get transport data from localStorage or API
    const transportData = localStorage.getItem('selectedTransport')
    if (transportData) {
      const parsed = JSON.parse(transportData)
      setTransport(parsed)
      if (parsed.places && parsed.places.length > 0) {
        setSelectedPlace(parsed.places[0])
      }
      
      // Get all available images for this transport type
      const images = getTransportImages(parsed.type, parsed.places, 5)
      setTransportImages(images)
    }
    setLoading(false)
  }, [params.id])

  const getTransportImage = (type, size = 'large') => {
    const images = {
      walking: {
        large: "/placeholder.svg?height=400&width=800&text=Walking+Paths",
        small: "/placeholder.svg?height=200&width=300&text=Walking"
      },
      cycling_routes: {
        large: "/placeholder.svg?height=400&width=800&text=Cycling+Routes",
        small: "/placeholder.svg?height=200&width=300&text=Cycling"
      },
      bicycle_store: {
        large: "/placeholder.svg?height=400&width=800&text=Bike+Rental+Station",
        small: "/placeholder.svg?height=200&width=300&text=Bike+Rental"
      },
      transit_station: {
        large: "/placeholder.svg?height=400&width=800&text=Public+Transit+Hub",
        small: "/placeholder.svg?height=200&width=300&text=Transit"
      },
      train_station: {
        large: "/placeholder.svg?height=400&width=800&text=Train+Station",
        small: "/placeholder.svg?height=200&width=300&text=Train"
      },
      subway_station: {
        large: "/placeholder.svg?height=400&width=800&text=Metro+Station",
        small: "/placeholder.svg?height=200&width=300&text=Metro"
      },
      bus_station: {
        large: "/placeholder.svg?height=400&width=800&text=Bus+Terminal",
        small: "/placeholder.svg?height=200&width=300&text=Bus"
      },
      electric_vehicle_charging_station: {
        large: "/placeholder.svg?height=400&width=800&text=EV+Charging+Hub",
        small: "/placeholder.svg?height=200&width=300&text=EV+Charging"
      }
    }
    return images[type]?.[size] || "/placeholder.svg"
  }

  const openInMaps = (place) => {
    if (place && place.location) {
      const url = `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Leaf className="animate-spin mr-2 text-green-600" size={24} />
          Loading transport details...
        </div>
      </div>
    )
  }

  if (!transport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Transport Not Found</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Transport Options
          </button>
          
          <div className="flex items-center">
            <span className="text-3xl mr-3">{transport.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{transport.name}</h1>
              <p className="text-gray-600">{transport.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image Gallery */}
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
              {transportImages.length > 0 ? (
                <>
                  <Image
                    src={transportImages[currentImageIndex]?.url || getTransportImage(transport.type, 'large')}
                    alt={transportImages[currentImageIndex]?.alt || transport.name}
                    fill
                    className="object-cover transition-opacity duration-300"
                  />
                  
                  {/* Image Navigation */}
                  {transportImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === 0 ? transportImages.length - 1 : prev - 1
                        )}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === transportImages.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        →
                      </button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {transportImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Photo Source Indicator */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
                    <Camera size={12} className="mr-1" />
                    {transportImages[currentImageIndex]?.source === 'google_places' ? 
                      `📍 ${transportImages[currentImageIndex]?.placeName}` : 
                      '📷 Stock Photo'
                    }
                  </div>
                </>
              ) : (
                <Image
                  src={getTransportImage(transport.type, 'large')}
                  alt={transport.name}
                  fill
                  className="object-cover"
                />
              )}
              
              <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {'⭐'.repeat(transport.carbonRating)} Eco Rating
              </div>
              {transport.carbonEmission === 0 && (
                <div className="absolute top-4 right-4 bg-green-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                  🌱 Zero Emissions
                </div>
              )}
            </div>

            {/* Image Gallery Thumbnails */}
            {transportImages.length > 1 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Camera className="mr-2" size={20} />
                  Photo Gallery ({transportImages.length})
                </h3>
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {transportImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                      />
                      {image.source === 'google_places' && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Green dot indicates real photos from Google Places
                </p>
              </div>
            )}

            {/* Transport Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Transport Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{transport.carbonRating}/5</div>
                  <div className="text-sm text-gray-600">Eco Rating</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{transport.carbonEmission}</div>
                  <div className="text-sm text-gray-600">kg CO₂/km</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">${transport.price}</div>
                  <div className="text-sm text-gray-600">Estimated Cost</div>
                </div>
              </div>
            </div>

            {/* Eco Impact */}
            {transport.ecoImpact && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Leaf className="mr-2 text-green-600" size={20} />
                  Environmental Impact
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">{transport.ecoImpact}</p>
                </div>
                {transport.recommendations && transport.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Recommendations:</h3>
                    <ul className="space-y-2">
                      {transport.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <Info size={16} className="mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Locations List */}
            {transport.places && transport.places.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <MapPin className="mr-2 text-blue-600" size={20} />
                  Nearby Locations ({transport.places.length})
                </h2>
                <div className="space-y-4">
                  {transport.places.map((place, index) => (
                    <div
                      key={place.placeId || index}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPlace?.placeId === place.placeId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlace(place)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{place.name}</h3>
                          {place.vicinity && (
                            <p className="text-sm text-gray-600 mt-1">{place.vicinity}</p>
                          )}
                          <div className="flex items-center mt-2 space-x-4">
                            {place.rating !== 'N/A' && (
                              <div className="flex items-center">
                                <Star size={14} className="text-yellow-500 mr-1" />
                                <span className="text-sm">{place.rating}</span>
                                {place.userRatingsTotal > 0 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({place.userRatingsTotal} reviews)
                                  </span>
                                )}
                              </div>
                            )}
                            {place.openNow !== undefined && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                place.openNow
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {place.openNow ? 'Open Now' : 'Closed'}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openInMaps(place)
                          }}
                          className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          <Navigation size={14} className="inline mr-1" />
                          Directions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {selectedPlace && (
                  <button
                    onClick={() => openInMaps(selectedPlace)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Navigation size={16} className="mr-2" />
                    Get Directions
                  </button>
                )}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: transport.name,
                        text: transport.description,
                        url: window.location.href
                      })
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <Globe size={16} className="mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Selected Location Details */}
            {selectedPlace && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Location Details</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-800">{selectedPlace.name}</h4>
                    {selectedPlace.vicinity && (
                      <p className="text-sm text-gray-600">{selectedPlace.vicinity}</p>
                    )}
                  </div>
                  
                  {selectedPlace.rating !== 'N/A' && (
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-500 mr-2" />
                      <span>{selectedPlace.rating} / 5</span>
                      {selectedPlace.userRatingsTotal > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({selectedPlace.userRatingsTotal} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {selectedPlace.priceLevel && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Price Level:</span>
                      <span className="text-green-600">
                        {'$'.repeat(selectedPlace.priceLevel)}
                      </span>
                    </div>
                  )}

                  {selectedPlace.openNow !== undefined && (
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      <span className={selectedPlace.openNow ? 'text-green-600' : 'text-red-600'}>
                        {selectedPlace.openNow ? 'Currently Open' : 'Currently Closed'}
                      </span>
                    </div>
                  )}

                  {selectedPlace.types && (
                    <div>
                      <span className="text-sm text-gray-600">Categories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPlace.types.slice(0, 3).map((type, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {type.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}