'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MapPin, Clock, Leaf, Users, Calendar, Navigation, TreePine, Car, Building2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import TransportImageCard from "@/components/TransportImageCard"
import { useGoogleMaps } from "@/hooks/useGoogleMaps"
import { useUserLocation } from "@/hooks/useUserLocation"
import { useItinerary } from "@/hooks/useItinerary"
import SustainabilityMetrics from "@/components/itinerary/SustainabilityMetrics"
import ActivityCard from "@/components/itinerary/ActivityCard"
import AccommodationCard from "@/components/itinerary/AccommodationCard"
import MapControls from "@/components/itinerary/MapControls"
import DaySelector from "@/components/itinerary/DaySelector"
import TripSummary from "@/components/itinerary/TripSummary"
import SustainabilityFeatures from "@/components/itinerary/SustainabilityFeatures"
import EmptyState from "@/components/itinerary/EmptyState"
import LoadingState from "@/components/itinerary/LoadingState"
import NotFoundState from "@/components/itinerary/NotFoundState"
import ActivityDetailsModal from "@/components/itinerary/ActivityDetailsModal"
import { calculateRouteFromUserLocation, createMarkerIcon, createInfoWindowContent, getMapCenter } from "@/utils/mapHelpers"
import { ITINERARY_TABS } from "@/constants/itineraryTabs"

export default function ItineraryPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDay, setSelectedDay] = useState(1)
  const [showUserLocationRoutes, setShowUserLocationRoutes] = useState(false)
  const [routeMode, setRouteMode] = useState('WALKING')
  const [selectedActivity, setSelectedActivity] = useState(null)

  const { itinerary, loading } = useItinerary(params.id)
  const { mapLoaded, map, markers, setMarkers, directionsService, directionsRenderer, clearMapMarkers, initializeMap } = useGoogleMaps()
  const { userLocation, locationPermission, isGettingLocation, getUserLocation } = useUserLocation()

  useEffect(() => {
    if (mapLoaded && activeTab === 'map' && itinerary) {
      initializeMapWithData()
    }
  }, [mapLoaded, activeTab, itinerary])

  // Re-render map when user location or route settings change
  useEffect(() => {
    if (map && activeTab === 'map' && itinerary) {
      displayDayOnMap(selectedDay)
    }
  }, [userLocation, showUserLocationRoutes, routeMode, selectedDay, map, activeTab, itinerary])

  const initializeMapWithData = () => {
    const mapElement = document.getElementById('itinerary-map')
    if (!mapElement) return

    const mapCenter = getMapCenter(itinerary)
    const mapInstance = initializeMap(mapElement, mapCenter)
    
    if (mapInstance) {
      displayDayOnMap(selectedDay, mapInstance.map, mapInstance.directionsService, mapInstance.directionsRenderer)
    }
  }

  const displayDayOnMap = (dayNumber, mapInstance = map, directionsServiceInstance = directionsService, directionsRendererInstance = directionsRenderer) => {
    if (!mapInstance || !itinerary) return

    clearMapMarkers()

    const day = itinerary.days?.find(d => d.day === dayNumber)
    if (!day) return

    const newMarkers = []

    // Add user location marker if available
    if (userLocation && showUserLocationRoutes) {
      try {
        const userMarker = createMapMarker(mapInstance, userLocation, 'user', null, 'Your Location')
        const userInfoWindow = new window.google.maps.InfoWindow({
          content: createInfoWindowContent('user', null, userLocation, showUserLocationRoutes)
        })
        userMarker.addListener('click', () => userInfoWindow.open(mapInstance, userMarker))
        newMarkers.push(userMarker)
      } catch (error) {
        console.error('Error adding user location marker:', error)
      }
    }

    // Add accommodation markers
    if (itinerary.accommodations) {
      itinerary.accommodations.forEach((hotel) => {
        if (hotel.coordinates) {
          const position = { lat: hotel.coordinates.latitude, lng: hotel.coordinates.longitude }
          const marker = createMapMarker(mapInstance, position, 'hotel', null, hotel.name)
          const infoWindow = new window.google.maps.InfoWindow({
            content: createInfoWindowContent('hotel', hotel, userLocation, showUserLocationRoutes)
          })
          marker.addListener('click', () => infoWindow.open(mapInstance, marker))
          newMarkers.push(marker)
        }
      })
    }

    // Add activity markers for the selected day
    if (day.activities?.length > 0) {
      const activitiesWithCoords = day.activities.filter(activity =>
        activity.coordinates?.lat && activity.coordinates?.lng
      )

      activitiesWithCoords.forEach((activity, index) => {
        const position = { lat: activity.coordinates.lat, lng: activity.coordinates.lng }
        const marker = createMapMarker(mapInstance, position, 'activity', index, activity.title)
        const infoWindow = new window.google.maps.InfoWindow({
          content: createInfoWindowContent('activity', activity, userLocation, showUserLocationRoutes)
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker)
          if (userLocation && showUserLocationRoutes) {
            calculateRouteFromUserLocation(userLocation, position, routeMode, directionsServiceInstance, directionsRendererInstance)
          }
        })

        newMarkers.push(marker)
      })

      // Create route through all activities
      if (activitiesWithCoords.length > 1) {
        createActivityRoute(activitiesWithCoords, directionsServiceInstance, directionsRendererInstance)
      } else if (activitiesWithCoords.length === 1) {
        mapInstance.setCenter({ lat: activitiesWithCoords[0].coordinates.lat, lng: activitiesWithCoords[0].coordinates.lng })
        mapInstance.setZoom(15)
        updateRouteInfo('single')
      }
    }

    setMarkers(newMarkers)
    fitMapToBounds(mapInstance, newMarkers)
  }

  const createMapMarker = (mapInstance, position, type, index, title) => {
    const icon = createMarkerIcon(type, index)
    const markerOptions = {
      position,
      map: mapInstance,
      title,
      zIndex: type === 'user' ? 2000 : type === 'hotel' ? 1000 : 100 + (index || 0)
    }
    
    // Only add icon if it's available
    if (icon) {
      markerOptions.icon = icon
    }
    
    return new window.google.maps.Marker(markerOptions)
  }

  const createActivityRoute = (activities, directionsServiceInstance, directionsRendererInstance) => {
    if (!directionsServiceInstance || !directionsRendererInstance) return

    const waypoints = activities.slice(1, -1).map(activity => ({
      location: { lat: activity.coordinates.lat, lng: activity.coordinates.lng },
      stopover: true
    }))

    const routeRequest = {
      origin: { lat: activities[0].coordinates.lat, lng: activities[0].coordinates.lng },
      destination: { lat: activities[activities.length - 1].coordinates.lat, lng: activities[activities.length - 1].coordinates.lng },
      waypoints,
      travelMode: window.google.maps.TravelMode.WALKING,
      optimizeWaypoints: false,
      avoidHighways: true,
      avoidTolls: true
    }

    directionsServiceInstance.route(routeRequest, (result, status) => {
      if (status === 'OK') {
        directionsRendererInstance.setDirections(result)
        const route = result.routes[0]
        const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0)
        const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0)
        updateRouteInfo('success', { activities: activities.length, distance: totalDistance, duration: totalDuration })
      } else {
        console.error('Directions request failed:', status)
        updateRouteInfo('error')
      }
    })
  }

  const updateRouteInfo = (type, data = {}) => {
    const routeInfoDiv = document.getElementById('route-info')
    if (!routeInfoDiv) return

    const content = {
      success: `
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
          <div class="flex items-center gap-4 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">📍</span>
              <span class="font-medium">${data.activities} stops</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">🚶</span>
              <span class="font-medium">${(data.distance / 1000).toFixed(1)} km</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">⏱️</span>
              <span class="font-medium">${Math.round(data.duration / 60)} min walking</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">🌱</span>
              <span class="font-medium">0kg CO₂ (walking route)</span>
            </div>
          </div>
        </div>
      `,
      error: `
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div class="flex items-center gap-2 text-sm text-yellow-700">
            <span>⚠️</span>
            <span>Route calculation unavailable. Showing activity locations only.</span>
          </div>
        </div>
      `,
      single: `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div class="flex items-center gap-2 text-sm text-blue-700">
            <span>📍</span>
            <span>Single activity location shown</span>
          </div>
        </div>
      `
    }

    routeInfoDiv.innerHTML = content[type] || ''
  }

  const fitMapToBounds = (mapInstance, markers) => {
    if (markers.length === 0) return

    const bounds = new window.google.maps.LatLngBounds()
    markers.forEach(marker => bounds.extend(marker.getPosition()))
    
    if (userLocation && showUserLocationRoutes) {
      bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng))
    }
    
    mapInstance.fitBounds(bounds)

    const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
      if (mapInstance.getZoom() > 16) mapInstance.setZoom(16)
      if (mapInstance.getZoom() < 10) mapInstance.setZoom(10)
      window.google.maps.event.removeListener(listener)
    })
  }



  if (loading) return <LoadingState />
  if (!itinerary) return <NotFoundState />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/itineraries"
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{itinerary.title}</h1>
              <div className="flex items-center gap-6 text-emerald-100 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{itinerary.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{itinerary.duration} days</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{itinerary.travelers} travelers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Leaf size={16} />
                  <span>Eco Score: {itinerary.sustainability?.ecoScore}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {ITINERARY_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <SustainabilityMetrics 
              sustainability={itinerary.sustainability}
              summary={itinerary.summary}
              days={itinerary.days}
            />

            <TripSummary itinerary={itinerary} />
            <SustainabilityFeatures features={itinerary.sustainability?.sustainabilityFeatures} />
          </div>
        )}

        {/* Daily Itinerary Tab */}
        {activeTab === 'itinerary' && itinerary.days && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Daily Itinerary</h2>
            <div className="space-y-8">
              {itinerary.days.map((day) => (
                <div key={day.day} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Day {day.day}: {day.theme}
                        </h3>
                        <p className="text-gray-600 mt-1">{day.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 px-4 py-2 rounded-full">
                          <span className="text-emerald-700 font-semibold">
                            Eco Score: {day.sustainabilityScore}/5
                          </span>
                        </div>
                        <div className="bg-blue-100 px-4 py-2 rounded-full">
                          <span className="text-blue-700 font-semibold">
                            {day.activities?.length || 0} activities
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    {day.activities.map((activity, idx) => (
                      <ActivityCard 
                        key={idx} 
                        activity={activity} 
                        index={idx}
                        onViewDetails={setSelectedActivity}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accommodations Tab */}
        {activeTab === 'accommodations' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Eco-Friendly Accommodations</h2>
            {itinerary.accommodations && itinerary.accommodations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {itinerary.accommodations.map((hotel) => (
                  <AccommodationCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Building2}
                title="No Accommodations Listed"
                description="Accommodation details are not available for this itinerary."
              />
            )}
          </div>
        )}

        {/* Transport Tab */}
        {activeTab === 'transport' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Sustainable Transport Options</h2>
            {itinerary.transport && itinerary.transport.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {itinerary.transport.map((transport, idx) => (
                    <TransportImageCard key={idx} transport={transport} />
                  ))}
                </div>

                {/* Transport Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Transport Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {itinerary.transport.filter(t => t.ecoScore >= 4).length}
                      </div>
                      <div className="text-sm text-green-700">Eco-Friendly Options</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {itinerary.transport.reduce((sum, t) => sum + t.count, 0)}
                      </div>
                      <div className="text-sm text-blue-700">Total Stations</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {Math.round(itinerary.transport.reduce((sum, t) => sum + t.carbonSavings, 0) * 10) / 10}kg
                      </div>
                      <div className="text-sm text-purple-700">CO₂ Savings</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {Math.round(itinerary.transport.reduce((sum, t) => sum + t.ecoScore, 0) / itinerary.transport.length * 10) / 10}/5
                      </div>
                      <div className="text-sm text-orange-700">Avg Eco Score</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState 
                icon={Car}
                title="No Transport Options Listed"
                description="Transport information is not available for this itinerary."
              />
            )}
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Interactive Daily Map</h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">🏨</div>
                  <span className="text-sm font-medium">Hotels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                  <span className="text-sm font-medium">Activities</span>
                </div>
                {userLocation && showUserLocationRoutes && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">📍</div>
                    <span className="text-sm font-medium">Your Location</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-emerald-500 rounded"></div>
                  <span className="text-sm font-medium">Route</span>
                </div>

              </div>
            </div>

            {/* Check if we have location data */}
            {!itinerary.days?.some(day => day.activities?.some(activity => activity.coordinates)) &&
              !itinerary.accommodations?.some(hotel => hotel.coordinates) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-yellow-600">⚠️</div>
                    <h3 className="font-semibold text-yellow-800">Map Data Unavailable</h3>
                  </div>
                  <p className="text-yellow-700">
                    Location coordinates are not available for this itinerary. The map feature requires location data to display activities and accommodations.
                  </p>
                </div>
              )}

            <DaySelector 
              days={itinerary.days}
              selectedDay={selectedDay}
              onDaySelect={(day) => {
                setSelectedDay(day)
                displayDayOnMap(day)
              }}
            />

            <MapControls
              userLocation={userLocation}
              locationPermission={locationPermission}
              isGettingLocation={isGettingLocation}
              showUserLocationRoutes={showUserLocationRoutes}
              routeMode={routeMode}
              getUserLocation={getUserLocation}
              setShowUserLocationRoutes={setShowUserLocationRoutes}
              setRouteMode={setRouteMode}
            />



            {/* Map Container */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Day {selectedDay}: {itinerary.days?.find(d => d.day === selectedDay)?.theme}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {itinerary.days?.find(d => d.day === selectedDay)?.activities?.length || 0} stops
                    </span>
                    <span className="text-emerald-600 font-medium">
                      {itinerary.days?.find(d => d.day === selectedDay)?.carbonFootprint || 0}kg CO₂
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="px-6 py-4">
                <div id="route-info">
                  {/* Route info will be populated by JavaScript */}
                </div>
              </div>

              <div
                id="itinerary-map"
                className="w-full"
                style={{ minHeight: '600px' }}
              >
                {!mapLoaded && (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mx-auto mb-2"></div>
                      <div className="text-gray-500">Loading interactive map...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Day Activities List */}
            {itinerary.days?.find(d => d.day === selectedDay) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Day {selectedDay} Itinerary
                </h3>
                <div className="space-y-4">
                  {itinerary.days.find(d => d.day === selectedDay).activities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-gray-900">{activity.title}</span>
                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {activity.time}
                          </span>
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                            {activity.carbonFootprint}kg CO₂
                          </span>
                        </div>
                        {/* <p className="text-sm text-gray-600 mb-2">{activity.description}</p> */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin size={12} />
                          <span>{activity.location}</span>
                          <span>•</span>
                          <span>{activity.carbonFootprint}kg CO₂</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-emerald-800">Day {selectedDay} Summary</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-emerald-700">
                        Activities: <span className="font-bold">{itinerary.days.find(d => d.day === selectedDay).activities?.length || 0}</span>
                      </span>
                      <span className="text-emerald-700">
                        Carbon: <span className="font-bold">{itinerary.days.find(d => d.day === selectedDay).carbonFootprint}kg CO₂</span>
                      </span>
                      <span className="text-emerald-700">
                        Eco Score: <span className="font-bold">{itinerary.days.find(d => d.day === selectedDay).sustainabilityScore}/5</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Map Legend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-50 p-6 rounded-xl">
                <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  🏨 Accommodations
                </h3>
                <div className="space-y-2">
                  {itinerary.accommodations?.map((hotel, idx) => (
                    <div key={idx} className="text-emerald-700 font-medium text-sm">
                      • {hotel.name} ({hotel.distance?.value} {hotel.distance?.unit})
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                  📍 All Days Overview
                </h3>
                <div className="space-y-2">
                  {itinerary.days?.map((day, idx) => (
                    <div key={idx} className="text-blue-700 font-medium text-sm">
                      Day {day.day}: {day.activities?.length || 0} stops • {day.carbonFootprint}kg CO₂
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl">
                <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                  🚌 Transport Options
                </h3>
                <div className="space-y-2">
                  {itinerary.transport?.slice(0, 3).map((transport, idx) => (
                    <div key={idx} className="text-purple-700 font-medium text-sm">
                      {transport.icon} {transport.name} (Eco: {transport.ecoScore}/5)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <ActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  )
}
