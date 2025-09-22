'use client'

import { useState, useEffect } from 'react'

export const useGoogleMaps = () => {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])
  const [directionsService, setDirectionsService] = useState(null)
  const [directionsRenderer, setDirectionsRenderer] = useState(null)

  useEffect(() => {
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.onload = () => setMapLoaded(true)
      script.onerror = () => {
        console.error('Failed to load Google Maps API')
      }
      document.head.appendChild(script)
    } else if (window.google) {
      setMapLoaded(true)
    }
  }, [])

  const clearMapMarkers = () => {
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] })
    }
    const routeInfoDiv = document.getElementById('route-info')
    if (routeInfoDiv) {
      routeInfoDiv.innerHTML = ''
    }
  }

  const initializeMap = (mapElement, center) => {
    if (!mapElement || !window.google) return null

    const newMap = new window.google.maps.Map(mapElement, {
      center,
      zoom: 13,
      styles: [
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          stylers: [{ visibility: 'simplified' }]
        }
      ]
    })

    const newDirectionsService = new window.google.maps.DirectionsService()
    const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#10b981',
        strokeWeight: 5,
        strokeOpacity: 0.9,
        geodesic: true
      },
      preserveViewport: false
    })

    newDirectionsRenderer.setMap(newMap)

    setMap(newMap)
    setDirectionsService(newDirectionsService)
    setDirectionsRenderer(newDirectionsRenderer)

    return { map: newMap, directionsService: newDirectionsService, directionsRenderer: newDirectionsRenderer }
  }

  return {
    mapLoaded,
    map,
    markers,
    setMarkers,
    directionsService,
    directionsRenderer,
    clearMapMarkers,
    initializeMap
  }
}