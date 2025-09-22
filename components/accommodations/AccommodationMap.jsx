'use client'

import { useEffect, useState } from 'react'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import { useUserLocation } from '@/hooks/useUserLocation'
import { calculateRouteFromUserLocation, createMarkerIcon, getMapCenter } from '@/utils/mapHelpers'
import MapControls from '@/components/itinerary/MapControls'

export default function AccommodationMap({ accommodations, selectedAccommodation, onAccommodationSelect }) {
  const [showUserLocationRoutes, setShowUserLocationRoutes] = useState(false)
  const [routeMode, setRouteMode] = useState('DRIVING')

  const { mapLoaded, map, markers, setMarkers, directionsService, directionsRenderer, clearMapMarkers, initializeMap } = useGoogleMaps()
  const { userLocation, locationPermission, isGettingLocation, getUserLocation } = useUserLocation()

  useEffect(() => {
    if (mapLoaded && accommodations.length > 0) {
      initializeAccommodationMap()
    }
  }, [mapLoaded, accommodations])

  useEffect(() => {
    if (map && accommodations.length > 0) {
      displayAccommodationsOnMap()
    }
  }, [map, accommodations, userLocation, showUserLocationRoutes])

  const initializeAccommodationMap = () => {
    const mapElement = document.getElementById('accommodation-map')
    if (!mapElement) return

    // Get center from first accommodation or default
    const mapCenter = accommodations.length > 0 && accommodations[0].coordinates
      ? { lat: accommodations[0].coordinates.latitude, lng: accommodations[0].coordinates.longitude }
      : { lat: 48.8566, lng: 2.3522 } // Paris default

    const mapInstance = initializeMap(mapElement, mapCenter)
    
    if (mapInstance) {
      displayAccommodationsOnMap(mapInstance.map, mapInstance.directionsService, mapInstance.directionsRenderer)
    }
  }

  const displayAccommodationsOnMap = (mapInstance = map, directionsServiceInstance = directionsService, directionsRendererInstance = directionsRenderer) => {
    if (!mapInstance || accommodations.length === 0) return

    clearMapMarkers()
    const newMarkers = []

    // Add user location marker if available
    if (userLocation && showUserLocationRoutes) {
      try {
        const icon = createMarkerIcon('user')
        const markerOptions = {
          position: userLocation,
          map: mapInstance,
          title: 'Your Location',
          zIndex: 2000
        }
        
        if (icon) {
          markerOptions.icon = icon
        }
        
        const userMarker = new window.google.maps.Marker(markerOptions)

        const userInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">📍 Your Current Location</h3>
              <p class="text-sm text-gray-600">Click on any accommodation to get directions</p>
            </div>
          `
        })

        userMarker.addListener('click', () => {
          userInfoWindow.open(mapInstance, userMarker)
        })

        newMarkers.push(userMarker)
      } catch (error) {
        console.error('Error adding user location marker:', error)
      }
    }

    // Add accommodation markers
    accommodations.forEach((accommodation, index) => {
      if (accommodation.coordinates) {
        const position = { 
          lat: accommodation.coordinates.latitude, 
          lng: accommodation.coordinates.longitude 
        }

        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title: accommodation.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="16" fill="${selectedAccommodation?.id === accommodation.id ? '#dc2626' : '#10b981'}" stroke="white" stroke-width="3"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🏨</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          },
          zIndex: selectedAccommodation?.id === accommodation.id ? 1500 : 1000
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: createAccommodationInfoWindow(accommodation, userLocation, showUserLocationRoutes)
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker)
          onAccommodationSelect?.(accommodation)
          
          // Calculate route if user location is available
          if (userLocation && showUserLocationRoutes) {
            calculateRouteFromUserLocation(userLocation, position, routeMode, directionsServiceInstance, directionsRendererInstance)
          }
        })

        newMarkers.push(marker)
      }
    })

    setMarkers(newMarkers)

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition())
      })
      
      if (userLocation && showUserLocationRoutes) {
        bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng))
      }
      
      mapInstance.fitBounds(bounds)

      const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
        if (mapInstance.getZoom() > 15) mapInstance.setZoom(15)
        if (mapInstance.getZoom() < 8) mapInstance.setZoom(8)
        window.google.maps.event.removeListener(listener)
      })
    }
  }

  const createAccommodationInfoWindow = (accommodation, userLocation, showRoutes) => {
    return `
      <div class="p-3 max-w-sm">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">${accommodation.ecoRating}/5 Eco</span>
          ${accommodation.rating ? `<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">★ ${accommodation.rating}/5</span>` : ''}
          ${accommodation.chainCode ? `<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">${accommodation.chainCode}</span>` : ''}
        </div>
        <h3 class="font-bold text-lg mb-2">${accommodation.name}</h3>
        ${accommodation.image ? `<img src="${accommodation.image}" alt="${accommodation.name}" class="w-full h-24 object-cover rounded mb-2" onerror="this.style.display='none'">` : ''}
        <p class="text-sm text-gray-600 mb-3">${accommodation.description?.substring(0, 120)}${accommodation.description?.length > 120 ? '...' : ''}</p>
        
        <div class="mb-2">
          <div class="text-xs text-gray-500 mb-1">Eco Features:</div>
          <div class="flex flex-wrap gap-1">
            ${accommodation.features?.slice(0, 3).map(feature => `
              <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">${feature}</span>
            `).join('') || ''}
            ${accommodation.features?.length > 3 ? `<span class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">+${accommodation.features.length - 3}</span>` : ''}
          </div>
        </div>
        
        <p class="text-xs text-gray-500 mb-2">📍 ${accommodation.location}</p>
        ${accommodation.distance ? `<p class="text-xs text-gray-500 mb-2">🚗 ${accommodation.distance.value?.toFixed(1)} ${accommodation.distance.unit} from center</p>` : ''}
        
        ${userLocation && showRoutes ? `
          <div class="mt-3 p-2 bg-green-50 rounded border border-green-200">
            <div class="text-xs text-green-700 font-medium mb-1">🗺️ Get Directions</div>
            <div class="text-xs text-green-600">Click this marker to calculate route from your location</div>
          </div>
        ` : ''}
        
        <div class="mt-3 pt-2 border-t border-gray-200">
          <button 
            onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(accommodation.name + ' ' + accommodation.location + ' booking')}', '_blank')"
            class="w-full px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    `
  }

  if (!mapLoaded) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mx-auto mb-2"></div>
          <div className="text-gray-500">Loading map...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Accommodation Locations
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">🏨</div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">🏨</div>
                <span className="text-gray-600">Selected</span>
              </div>
              {userLocation && showUserLocationRoutes && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">📍</div>
                  <span className="text-gray-600">Your Location</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div id="route-info">
            {/* Route info will be populated by JavaScript */}
          </div>
        </div>

        <div
          id="accommodation-map"
          className="w-full"
          style={{ minHeight: '500px' }}
        >
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mx-auto mb-2"></div>
              <div className="text-gray-500">Initializing map...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 p-6 rounded-xl">
          <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
            🏨 Accommodations Found
          </h3>
          <div className="space-y-2">
            <div className="text-emerald-700 font-medium text-sm">
              Total: {accommodations.length} eco-friendly options
            </div>
            <div className="text-emerald-700 text-sm">
              Average Eco Rating: {accommodations.length > 0 ? (accommodations.reduce((sum, acc) => sum + (acc.ecoRating || 0), 0) / accommodations.length).toFixed(1) : 0}/5
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
            🗺️ Map Instructions
          </h3>
          <div className="space-y-1 text-blue-700 text-sm">
            <div>• Click markers to see accommodation details</div>
            <div>• Enable location to get directions</div>
            <div>• Selected accommodation appears in red</div>
            <div>• Use controls above to customize routes</div>
          </div>
        </div>
      </div>
    </div>
  )
}