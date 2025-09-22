'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Star, ExternalLink, Clock, Leaf, Navigation } from 'lucide-react'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import { useUserLocation } from '@/hooks/useUserLocation'
import { calculateRouteFromUserLocation, createMarkerIcon } from '@/utils/mapHelpers'

export default function ActivityDetailsModal({ activity, onClose }) {
  const [activityDetails, setActivityDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRoutes, setShowRoutes] = useState(false)
  const [routeMode, setRouteMode] = useState('WALKING')

  const { mapLoaded, initializeMap } = useGoogleMaps()
  const { userLocation, getUserLocation } = useUserLocation()

  useEffect(() => {
    if (activity?.wikidata || activity?.id) {
      fetchActivityDetails()
    } else {
      // Use existing activity data if no external ID
      setActivityDetails(activity)
      setLoading(false)
    }
  }, [activity])

  useEffect(() => {
    if (mapLoaded && activityDetails?.coordinates) {
      initializeActivityMap()
    }
  }, [mapLoaded, activityDetails])

  const fetchActivityDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to use wikidata ID or activity ID
      const xid = activity.wikidata || activity.id
      if (!xid) {
        setActivityDetails(activity)
        setLoading(false)
        return
      }

      const response = await fetch(`/api/activities/details/${xid}`)
      const result = await response.json()

      if (result.success) {
        // Merge with existing activity data
        setActivityDetails({
          ...activity,
          ...result.data,
          // Keep original activity data as fallback
          title: result.data.name || activity.title,
          description: result.data.description || activity.description,
          coordinates: result.data.coordinates || activity.coordinates
        })
      } else {
        setActivityDetails(activity)
      }
    } catch (err) {
      console.error('Error fetching activity details:', err)
      setActivityDetails(activity)
      setError('Failed to load detailed information')
    } finally {
      setLoading(false)
    }
  }

  const initializeActivityMap = () => {
    const mapElement = document.getElementById('activity-detail-map')
    if (!mapElement || !activityDetails?.coordinates) return

    const center = {
      lat: activityDetails.coordinates.lat,
      lng: activityDetails.coordinates.lng
    }

    const mapInstance = initializeMap(mapElement, center)
    if (!mapInstance) return

    // Add activity marker
    const activityIcon = createMarkerIcon('activity', 0)
    const activityMarkerOptions = {
      position: center,
      map: mapInstance.map,
      title: activityDetails.title || activityDetails.name,
      zIndex: 1000
    }

    if (activityIcon) {
      activityMarkerOptions.icon = activityIcon
    }

    const activityMarker = new window.google.maps.Marker(activityMarkerOptions)

    // Add user location marker if available
    if (userLocation && showRoutes) {
      const userIcon = createMarkerIcon('user')
      const userMarkerOptions = {
        position: userLocation,
        map: mapInstance.map,
        title: 'Your Location',
        zIndex: 2000
      }

      if (userIcon) {
        userMarkerOptions.icon = userIcon
      }

      const userMarker = new window.google.maps.Marker(userMarkerOptions)

      // Calculate route
      calculateRouteFromUserLocation(
        userLocation,
        center,
        routeMode,
        mapInstance.directionsService,
        mapInstance.directionsRenderer,
        'route-info-modal'
      )

      // Fit bounds to show both markers
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(center)
      bounds.extend(userLocation)
      mapInstance.map.fitBounds(bounds)
    } else {
      // Center on activity
      mapInstance.map.setCenter(center)
      mapInstance.map.setZoom(15)
    }
  }

  const handleGetDirections = async () => {
    if (!userLocation) {
      try {
        await getUserLocation()
      } catch (error) {
        console.error('Failed to get location:', error)
        return
      }
    }
    setShowRoutes(true)
    // Re-initialize map with routes
    setTimeout(() => initializeActivityMap(), 100)
  }

  if (!activity) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading...' : activityDetails?.title || activityDetails?.name || 'Activity Details'}
            </h2>
            {activityDetails?.address?.full && (
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <MapPin size={16} />
                {activityDetails.address.full}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Left Panel - Details */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <p className="text-gray-600">Showing basic information</p>
              </div>
            ) : null}

            {activityDetails && (
              <div className="space-y-6">
                {/* Image */}
                {activityDetails.image && (
                  <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={activityDetails.image}
                      alt={activityDetails.title || activityDetails.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  {activityDetails.rating && (
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-yellow-400" />
                      <span className="font-medium">{activityDetails.rating}/5</span>
                    </div>
                  )}
                  {activityDetails.time && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-500" />
                      <span>{activityDetails.time}</span>
                    </div>
                  )}
                  {activityDetails.sustainabilityScore && (
                    <div className="flex items-center gap-2">
                      <Leaf size={16} className="text-green-500" />
                      <span>Eco Score: {activityDetails.sustainabilityScore}/5</span>
                    </div>
                  )}
                  {activityDetails.carbonFootprint && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🌱</span>
                      <span>{activityDetails.carbonFootprint}kg CO₂</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {activityDetails.description || 'No description available.'}
                  </p>
                </div>

                {/* Categories */}
                {activityDetails.kindsArray?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {activityDetails.kindsArray.map((kind, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {kind.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eco Features */}
                {activityDetails.ecoFeatures?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Eco Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {activityDetails.ecoFeatures.map((feature, idx) => (
                        <span key={idx} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                <div className="space-y-2">
                  {activityDetails.wikipedia && (
                    <a
                      href={activityDetails.wikipedia}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink size={16} />
                      Wikipedia Article
                    </a>
                  )}
                  {activityDetails.url && (
                    <a
                      href={activityDetails.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink size={16} />
                      Official Website
                    </a>
                  )}
                  {activityDetails.otm && (
                    <a
                      href={activityDetails.otm}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink size={16} />
                      OpenTripMap
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="lg:w-1/2 border-l border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Location & Directions</h3>
              
              {/* Route Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleGetDirections}
                    disabled={showRoutes && userLocation}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showRoutes && userLocation
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                    }`}
                  >
                    {showRoutes && userLocation ? (
                      <>
                        <Navigation size={16} className="inline mr-2" />
                        Directions Shown
                      </>
                    ) : (
                      <>
                        <Navigation size={16} className="inline mr-2" />
                        Get Directions
                      </>
                    )}
                  </button>

                  {showRoutes && (
                    <select
                      value={routeMode}
                      onChange={(e) => {
                        setRouteMode(e.target.value)
                        setTimeout(() => initializeActivityMap(), 100)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="WALKING">🚶 Walking</option>
                      <option value="DRIVING">🚗 Driving</option>
                      <option value="TRANSIT">🚌 Transit</option>
                    </select>
                  )}
                </div>

                {/* Route Info */}
                <div id="route-info-modal">
                  {/* Route information will be populated here */}
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div
              id="activity-detail-map"
              className="w-full h-96 lg:h-full min-h-[400px]"
            >
              {!mapLoaded && (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mx-auto mb-2"></div>
                    <div className="text-gray-500">Loading map...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}