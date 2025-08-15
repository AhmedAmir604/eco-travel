'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MapPin, Clock, Leaf, Star, Users, Calendar, Navigation, DollarSign, TreePine, Car, Building2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import TransportImageCard from "@/components/TransportImageCard"

export default function ItineraryPage() {
  const params = useParams()
  const [itinerary, setItinerary] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(1)
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])
  const [directionsService, setDirectionsService] = useState(null)
  const [directionsRenderer, setDirectionsRenderer] = useState(null)

  useEffect(() => {
    // Load Google Maps script
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    } else if (window.google) {
      setMapLoaded(true)
    }

    // Load itinerary data (you can replace this with actual API call)
    loadItineraryData()
  }, [params.id])

  useEffect(() => {
    if (mapLoaded && activeTab === 'map' && itinerary) {
      initializeMap()
    }
  }, [mapLoaded, activeTab, itinerary])

  const loadItineraryData = async () => {
    // Use mock data directly
    setLoading(true)

    // Sample data structure based on your API response
    const sampleItinerary = {
      id: params.id,
      destination: "Lahore",
      duration: 4,
      travelers: 2,
      coordinates: { lat: 31.5203696, lng: 74.35874729999999 },
      title: "Eco-Friendly Lahore Adventure",
      sustainability: {
        totalCarbonSaved: 158,
        ecoScore: 4,
        sustainabilityPercentage: 100,
        sustainabilityFeatures: [
          'Eco-certified accommodations',
          'Low-carbon transport options',
          'Nature-based activities',
          'Local community engagement',
          'Sustainable dining choices'
        ],
        ecoFriendlyActivities: 16,
        totalActivities: 16
      },
      summary: {
        totalCarbonFootprint: 6.5
      },
      accommodations: [
        {
          id: 'WVLHE678',
          name: 'THE NISHAT',
          location: 'Lahore (1.5 KM from center)',
          description: 'Eco-friendly accommodation committed to sustainable practices and environmental responsibility.',
          image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=300&photo_reference=ATKogpdiRSVI2PuDudwog_0CLOyGPDq8FwnhVYq8piXJCluF5-suj7t5WVrXYYDLwxQSlRGD3sqFRLoUO9fX0SOhns_8ppacCY6I811chbtGJ4g8gOiLhYRCRpUFUmdGQP6_9Dbl7bdv5WveehmXBfzoLPh1m29TzBksKG6P1_9rwLQBN9edepOOYEu6i7TVZKEZOsE7YbC0skL_iC6fPdHyU9gwqlwOGtXnNKQdW2pLVfM8eDkIgH5DEImHTBpUdCc1ltevYvE8FFnqGPEG5XiP1s973qaCqsfvjUSXk_6XQ8HI7olj2N0&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          ecoRating: '4.8',
          rating: '4.5',
          sustainabilityScore: 4,
          ecoFeatures: ['Local sourcing', 'Energy efficient lighting', 'Water conservation systems'],
          amenities: ['Restaurant', 'WiFi', 'Fitness Center'],
          distance: { value: 1.52, unit: 'KM' },
          coordinates: { latitude: 31.50719, longitude: 74.35435 },
          carbonFootprint: 14.4
        }
      ],
      transport: [
        {
          type: 'train_station',
          name: 'Train Stations',
          icon: '🚂',
          ecoScore: 5,
          carbonFactor: 0.025,
          count: 3,
          description: 'Excellent eco-friendly choice! Zero or ultra-low emissions.',
          availability: 'Available in area',
          recommendation: 'Perfect for eco-conscious travelers! Low emissions and great coverage.',
          carbonSavings: 1.75,
          image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=300&photo_reference=ATKogpfYxQ8YUN88YTE0r8ZS-5jFq7W8XI8VXMzuEqSXVfDvVq_caoGdMzUaGPZSMzL2-wE6ShNjm-WiRnKiMsJd-lFqMoU1inOmZJQl5DCr8a5oqSMQYA&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          places: [
            {
              name: 'Lahore Railway Station',
              vicinity: 'City Center',
              image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&maxheight=200&photo_reference=ATKogpfYxQ8YUN88YTE0r8ZS-5jFq7W8XI8VXMzuEqSXVfDvVq_caoGdMzUaGPZSMzL2-wE6ShNjm-WiRnKiMsJd-lFqMoU1inOmZJQl5DCr8a5oqSMQYA&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            },
            {
              name: 'Lahore Cantonment',
              vicinity: 'Cantonment Area',
              image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&maxheight=200&photo_reference=ATKogpdKQxQ8YUN88YTE0r8ZS-5jFq7W8XI8VXMzuEqSXVfDvVq_caoGdMzUaGPZSMzL2-wE6ShNjm-WiRnKiMsJd-lFqMoU1inOmZJQl5DCr8a5oqSMQYA&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            }
          ]
        },
        {
          type: 'transit_station',
          name: 'Public Transit Stations',
          icon: '🚌',
          ecoScore: 4,
          carbonFactor: 0.041,
          count: 20,
          description: 'Great sustainable option with low carbon footprint.',
          availability: 'Available in area',
          recommendation: 'Perfect for eco-conscious travelers! Low emissions and great coverage.',
          carbonSavings: 1.59,
          image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=300&photo_reference=ATKogpfBusStationLahore123456789&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          places: [
            {
              name: 'Kalma Chowk Bus Station',
              vicinity: 'Gulberg',
              image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&maxheight=200&photo_reference=ATKogpfBusStationLahore123456789&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            },
            {
              name: 'Liberty Market Bus Stop',
              vicinity: 'Liberty Market',
              image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&maxheight=200&photo_reference=ATKogpfBusStopLiberty987654321&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            }
          ]
        },
        {
          type: 'subway_station',
          name: 'Metro/Subway Stations',
          icon: '🚇',
          ecoScore: 4,
          carbonFactor: 0.035,
          count: 5,
          description: 'Great sustainable option with low carbon footprint.',
          availability: 'Available in area',
          recommendation: 'Perfect for eco-conscious travelers! Low emissions and great coverage.',
          carbonSavings: 1.65,
          image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=300&photo_reference=ATKogpfMetroLahore456789123&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          places: [
            {
              name: 'Dera Gujran Metro Station',
              vicinity: 'Orange Line',
              image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&maxheight=200&photo_reference=ATKogpfMetroLahore456789123&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            },
            {
              name: 'Anarkali Metro Station',
              vicinity: 'Orange Line',
              image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&maxheight=200&photo_reference=ATKogpfAnarkaliMetro789123456&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            }
          ]
        },
        {
          type: 'electric_vehicle_charging_station',
          name: 'EV Charging Stations',
          icon: '⚡',
          ecoScore: 3,
          carbonFactor: 0.053,
          count: 20,
          description: 'Good eco-friendly alternative, especially when shared.',
          availability: 'Available in area',
          recommendation: 'Perfect for eco-conscious travelers! Low emissions and great coverage.',
          carbonSavings: 1.47,
          image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=300&photo_reference=ATKogpfEVChargingLahore123&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          places: [
            {
              name: 'Tesla Supercharger Lahore',
              vicinity: 'DHA Phase 5',
              image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&maxheight=200&photo_reference=ATKogpfEVChargingLahore123&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            },
            {
              name: 'EV Station Gulberg',
              vicinity: 'Gulberg III',
              image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&maxheight=200&photo_reference=ATKogpfEVGulberg456789&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            }
          ]
        }
      ],
      days: [
        {
          day: 1,
          date: '2025-08-21',
          theme: 'Arrival & City Exploration',
          sustainabilityScore: 4,
          carbonFootprint: 2.5,
          activities: [
            {
              time: '09:00',
              title: 'Ejaz Art Gallery',
              description: 'Explore local art and cultural heritage in this sustainable gallery space featuring contemporary Pakistani artists.',
              location: 'Gulberg, Lahore',
              carbonFootprint: 0.2,
              ecoFeatures: ['Local artists', 'Sustainable materials', 'Community support'],
              coordinates: { lat: 31.513965606689453, lng: 74.3524398803711 }
            },
            {
              time: '11:30',
              title: 'Abdul Rehman Chughtai Museum',
              description: 'Discover the works of Pakistan\'s renowned artist in this eco-friendly museum space.',
              location: 'Lahore Cantonment',
              carbonFootprint: 0.3,
              ecoFeatures: ['Energy efficient lighting', 'Local heritage', 'Educational programs'],
              coordinates: { lat: 31.505781173706055, lng: 74.3304672241211 }
            },
            {
              time: '14:00',
              title: 'Liberty Market',
              description: 'Experience authentic local culture while supporting community vendors and artisans.',
              location: 'Liberty Market, Gulberg',
              carbonFootprint: 0.8,
              ecoFeatures: ['Local sourcing', 'Community engagement', 'Zero waste', 'Handmade crafts'],
              coordinates: { lat: 31.5203696, lng: 74.35874729999999 }
            },
            {
              time: '16:30',
              title: 'Gulberg Park',
              description: 'Relax in this green urban space and enjoy sustainable outdoor activities.',
              location: 'Gulberg III, Lahore',
              carbonFootprint: 0.1,
              ecoFeatures: ['Urban green space', 'Air purification', 'Wildlife habitat'],
              coordinates: { lat: 31.5180, lng: 74.3441 }
            },
            {
              time: '18:00',
              title: 'Sustainable Dinner at Local Restaurant',
              description: 'Enjoy farm-to-table dining featuring organic local ingredients.',
              location: 'MM Alam Road',
              carbonFootprint: 1.1,
              ecoFeatures: ['Organic ingredients', 'Local sourcing', 'Minimal packaging'],
              coordinates: { lat: 31.5167, lng: 74.3515 }
            }
          ]
        },
        {
          day: 2,
          date: '2025-08-22',
          theme: 'Cultural Heritage & History',
          sustainabilityScore: 5,
          carbonFootprint: 1.8,
          activities: [
            {
              time: '08:30',
              title: 'Lahore Fort (Shahi Qila)',
              description: 'Explore this UNESCO World Heritage site with guided eco-tours focusing on conservation efforts.',
              location: 'Walled City, Lahore',
              carbonFootprint: 0.4,
              ecoFeatures: ['Heritage conservation', 'Educational tours', 'Sustainable tourism'],
              coordinates: { lat: 31.5888, lng: 74.3073 }
            },
            {
              time: '11:00',
              title: 'Badshahi Mosque',
              description: 'Visit one of the world\'s largest mosques with focus on architectural preservation.',
              location: 'Walled City, Lahore',
              carbonFootprint: 0.1,
              ecoFeatures: ['Heritage preservation', 'Cultural education', 'Community space'],
              coordinates: { lat: 31.5881, lng: 74.3078 }
            },
            {
              time: '13:30',
              title: 'Traditional Lunch in Walled City',
              description: 'Authentic local cuisine prepared using traditional sustainable methods.',
              location: 'Food Street, Gawalmandi',
              carbonFootprint: 0.6,
              ecoFeatures: ['Traditional cooking', 'Local ingredients', 'Cultural preservation'],
              coordinates: { lat: 31.5804, lng: 74.3134 }
            },
            {
              time: '15:30',
              title: 'Wazir Khan Mosque',
              description: 'Marvel at the intricate tile work while learning about restoration using eco-friendly methods.',
              location: 'Walled City, Lahore',
              carbonFootprint: 0.2,
              ecoFeatures: ['Eco-friendly restoration', 'Heritage crafts', 'Sustainable materials'],
              coordinates: { lat: 31.5820, lng: 74.3142 }
            },
            {
              time: '17:00',
              title: 'Delhi Gate & Surroundings',
              description: 'Walking tour of historic gates with focus on urban conservation efforts.',
              location: 'Delhi Gate, Lahore',
              carbonFootprint: 0.5,
              ecoFeatures: ['Walking tour', 'Urban conservation', 'Community engagement'],
              coordinates: { lat: 31.5729, lng: 74.3282 }
            }
          ]
        },
        {
          day: 3,
          date: '2025-08-23',
          theme: 'Nature & Green Spaces',
          sustainabilityScore: 5,
          carbonFootprint: 1.2,
          activities: [
            {
              time: '07:00',
              title: 'Shalimar Gardens',
              description: 'Early morning visit to these Mughal gardens focusing on water conservation and botanical diversity.',
              location: 'Shalimar, Lahore',
              carbonFootprint: 0.3,
              ecoFeatures: ['Water conservation', 'Botanical diversity', 'Heritage gardens'],
              coordinates: { lat: 31.6007, lng: 74.3247 }
            },
            {
              time: '10:00',
              title: 'Jallo Park',
              description: 'Explore this large recreational park with focus on wildlife conservation and eco-education.',
              location: 'Jallo, Lahore',
              carbonFootprint: 0.2,
              ecoFeatures: ['Wildlife conservation', 'Eco-education', 'Green recreation'],
              coordinates: { lat: 31.4504, lng: 74.4297 }
            },
            {
              time: '13:00',
              title: 'Organic Farm Visit',
              description: 'Learn about sustainable farming practices and enjoy fresh organic lunch.',
              location: 'Outskirts of Lahore',
              carbonFootprint: 0.4,
              ecoFeatures: ['Organic farming', 'Sustainable agriculture', 'Farm-to-table'],
              coordinates: { lat: 31.4200, lng: 74.2800 }
            },
            {
              time: '16:00',
              title: 'Race Course Park',
              description: 'Afternoon in this urban green space with cycling and walking trails.',
              location: 'Race Course, Lahore',
              carbonFootprint: 0.1,
              ecoFeatures: ['Urban green space', 'Cycling paths', 'Air quality improvement'],
              coordinates: { lat: 31.5497, lng: 74.3436 }
            },
            {
              time: '18:30',
              title: 'Sunset at Lawrence Gardens',
              description: 'Evening relaxation in historic botanical gardens with guided nature walk.',
              location: 'Lawrence Gardens, Lahore',
              carbonFootprint: 0.2,
              ecoFeatures: ['Botanical conservation', 'Nature education', 'Urban biodiversity'],
              coordinates: { lat: 31.5497, lng: 74.3436 }
            }
          ]
        },
        {
          day: 4,
          date: '2025-08-24',
          theme: 'Local Community & Departure',
          sustainabilityScore: 4,
          carbonFootprint: 1.5,
          activities: [
            {
              time: '09:00',
              title: 'Local Artisan Workshop',
              description: 'Visit traditional craftspeople and learn about sustainable handicraft production.',
              location: 'Anarkali Bazaar',
              carbonFootprint: 0.3,
              ecoFeatures: ['Traditional crafts', 'Artisan support', 'Sustainable materials'],
              coordinates: { lat: 31.5688, lng: 74.3137 }
            },
            {
              time: '11:30',
              title: 'Recycling Center Tour',
              description: 'Educational visit to local recycling facility to understand waste management.',
              location: 'Industrial Area, Lahore',
              carbonFootprint: 0.4,
              ecoFeatures: ['Waste management', 'Recycling education', 'Environmental awareness'],
              coordinates: { lat: 31.4700, lng: 74.2900 }
            },
            {
              time: '14:00',
              title: 'Community Garden Project',
              description: 'Participate in local community gardening initiative and sustainable urban farming.',
              location: 'Model Town, Lahore',
              carbonFootprint: 0.2,
              ecoFeatures: ['Community engagement', 'Urban farming', 'Food security'],
              coordinates: { lat: 31.4816, lng: 74.3274 }
            },
            {
              time: '16:30',
              title: 'Farewell Sustainable Shopping',
              description: 'Last-minute shopping for eco-friendly souvenirs and local products.',
              location: 'Packages Mall Green Section',
              carbonFootprint: 0.6,
              ecoFeatures: ['Eco-friendly products', 'Local businesses', 'Sustainable packaging'],
              coordinates: { lat: 31.4697, lng: 74.4056 }
            }
          ]
        }
      ]
    }

    // Simulate a brief loading delay for realism
    setTimeout(() => {
      setItinerary(sampleItinerary)
      setLoading(false)
    }, 1000)
  }

  const initializeMap = () => {
    const mapElement = document.getElementById('itinerary-map')
    if (!mapElement || !window.google || !itinerary) return

    // Use coordinates from itinerary or fallback to first activity or accommodation
    let mapCenter = { lat: 31.5203696, lng: 74.35874729999999 } // Default to Lahore

    if (itinerary.coordinates) {
      mapCenter = { lat: itinerary.coordinates.lat, lng: itinerary.coordinates.lng }
    } else if (itinerary.days && itinerary.days[0] && itinerary.days[0].activities && itinerary.days[0].activities[0] && itinerary.days[0].activities[0].coordinates) {
      mapCenter = { lat: itinerary.days[0].activities[0].coordinates.lat, lng: itinerary.days[0].activities[0].coordinates.lng }
    } else if (itinerary.accommodations && itinerary.accommodations[0] && itinerary.accommodations[0].coordinates) {
      mapCenter = { lat: itinerary.accommodations[0].coordinates.latitude, lng: itinerary.accommodations[0].coordinates.longitude }
    }

    const newMap = new window.google.maps.Map(mapElement, {
      center: mapCenter,
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
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    })

    newDirectionsRenderer.setMap(newMap)

    setMap(newMap)
    setDirectionsService(newDirectionsService)
    setDirectionsRenderer(newDirectionsRenderer)

    // Load the selected day initially
    displayDayOnMap(selectedDay, newMap, newDirectionsService, newDirectionsRenderer)
  }

  const clearMapMarkers = () => {
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] })
    }
  }

  const displayDayOnMap = (dayNumber, mapInstance = map, directionsServiceInstance = directionsService, directionsRendererInstance = directionsRenderer) => {
    if (!mapInstance || !itinerary) return

    clearMapMarkers()

    const day = itinerary.days?.find(d => d.day === dayNumber)
    if (!day) return

    const newMarkers = []
    const waypoints = []

    // Add accommodation markers (always visible)
    if (itinerary.accommodations) {
      itinerary.accommodations.forEach((hotel, index) => {
        if (hotel.coordinates) {
          const marker = new window.google.maps.Marker({
            position: { lat: hotel.coordinates.latitude, lng: hotel.coordinates.longitude },
            map: mapInstance,
            title: hotel.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="16" fill="#10b981" stroke="white" stroke-width="3"/>
                  <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🏨</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 40)
            },
            zIndex: 1000
          })

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-3 max-w-xs">
                <h3 class="font-bold text-lg mb-2">${hotel.name}</h3>
                <p class="text-sm text-gray-600 mb-2">${hotel.location}</p>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Eco Score: ${hotel.sustainabilityScore}/5</span>
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">★ ${hotel.rating}</span>
                </div>
                <p class="text-xs text-gray-500">${hotel.description}</p>
              </div>
            `
          })

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker)
          })

          newMarkers.push(marker)
        }
      })
    }

    // Add activity markers for the selected day
    if (day.activities) {
      day.activities.forEach((activity, index) => {
        if (activity.coordinates) {
          const marker = new window.google.maps.Marker({
            position: { lat: activity.coordinates.lat, lng: activity.coordinates.lng },
            map: mapInstance,
            title: activity.title,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="14" fill="#3b82f6" stroke="white" stroke-width="3"/>
                  <text x="18" y="23" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(36, 36)
            },
            zIndex: 100 + index
          })

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-3 max-w-sm">
                <div class="flex items-center gap-2 mb-2">
                  <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">${activity.time}</span>
                  <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">${activity.carbonFootprint}kg CO₂</span>
                </div>
                <h3 class="font-bold text-lg mb-2">${activity.title}</h3>
                <p class="text-sm text-gray-600 mb-3">${activity.description}</p>
                <div class="flex flex-wrap gap-1 mb-2">
                  ${activity.ecoFeatures?.map(feature => `
                    <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">${feature}</span>
                  `).join('') || ''}
                </div>
                <p class="text-xs text-gray-500">📍 ${activity.location}</p>
                <p class="text-xs text-gray-500">🌱 ${activity.carbonFootprint}kg CO₂</p>
              </div>
            `
          })

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker)
          })

          newMarkers.push(marker)

          // Add to waypoints for route calculation
          if (index > 0) { // Skip first activity as it will be the origin
            waypoints.push({
              location: { lat: activity.coordinates.lat, lng: activity.coordinates.lng },
              stopover: true
            })
          }
        }
      })

      // Create route between activities
      if (day.activities.length > 1 && directionsServiceInstance && directionsRendererInstance) {
        const firstActivity = day.activities[0]
        const lastActivity = day.activities[day.activities.length - 1]

        if (firstActivity.coordinates && lastActivity.coordinates) {
          const request = {
            origin: { lat: firstActivity.coordinates.lat, lng: firstActivity.coordinates.lng },
            destination: { lat: lastActivity.coordinates.lat, lng: lastActivity.coordinates.lng },
            waypoints: waypoints,
            travelMode: window.google.maps.TravelMode.WALKING,
            optimizeWaypoints: true
          }

          directionsServiceInstance.route(request, (result, status) => {
            if (status === 'OK') {
              directionsRendererInstance.setDirections(result)
            }
          })
        }
      }
    }

    setMarkers(newMarkers)

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition())
      })
      mapInstance.fitBounds(bounds)

      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
        if (mapInstance.getZoom() > 16) mapInstance.setZoom(16)
        window.google.maps.event.removeListener(listener)
      })
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'itinerary', label: 'Daily Plan', icon: Calendar },
    { id: 'accommodations', label: 'Hotels', icon: Building2 },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'map', label: 'Map View', icon: Navigation }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your eco-friendly itinerary...</p>
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Itinerary not found</p>
          <Link href="/itineraries" className="text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
            Back to Itineraries
          </Link>
        </div>
      </div>
    )
  }

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
            {tabs.map((tab) => {
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
            {/* Sustainability Metrics */}
            <div className="bg-emerald-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-3">
                <Leaf size={24} />
                Sustainability Impact
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {itinerary.sustainability?.totalCarbonSaved || 0}kg
                  </div>
                  <div className="text-sm text-gray-600">CO₂ Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {itinerary.sustainability?.ecoScore || 4.5}/5
                  </div>
                  <div className="text-sm text-gray-600">Eco Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {itinerary.sustainability?.sustainabilityPercentage || 85}%
                  </div>
                  <div className="text-sm text-gray-600">Sustainable</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {itinerary.days?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Days</div>
                </div>
              </div>
            </div>

            {/* Trip Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Trip Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Duration:</span>
                    <span className="font-semibold text-lg">{itinerary.duration} days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Travelers:</span>
                    <span className="font-semibold text-lg">{itinerary.travelers} people</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Total Activities:</span>
                    <span className="font-semibold text-lg">{itinerary.sustainability?.totalActivities || 0}</span>
                  </div>
                  <div className="border-t-2 border-blue-200 pt-3 flex justify-between items-center p-3 bg-blue-100 rounded-lg">
                    <span className="font-bold text-blue-800">Destination:</span>
                    <span className="font-bold text-xl text-blue-800">{itinerary.destination}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <TreePine size={20} />
                  Environmental Impact
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Carbon Footprint:</span>
                    <span className="font-semibold text-lg">{itinerary.summary?.totalCarbonFootprint || 0}kg CO₂</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Carbon Saved:</span>
                    <span className="font-semibold text-lg text-green-600">{itinerary.sustainability?.totalCarbonSaved || 0}kg CO₂</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Eco Activities:</span>
                    <span className="font-semibold text-lg">{itinerary.sustainability?.ecoFriendlyActivities || 0}/{itinerary.sustainability?.totalActivities || 0}</span>
                  </div>
                  <div className="border-t-2 border-green-200 pt-3 p-3 bg-green-100 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-800 mb-1">
                        {itinerary.sustainability?.sustainabilityPercentage || 0}%
                      </div>
                      <div className="text-sm text-green-700">Sustainability Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sustainability Features */}
            {itinerary.sustainability?.sustainabilityFeatures && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Sustainability Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itinerary.sustainability.sustainabilityFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                      <Leaf size={20} className="text-emerald-600" />
                      <span className="text-emerald-800 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                      <div key={idx} className="flex gap-6 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="text-sm font-bold text-blue-600 min-w-[80px] bg-blue-100 px-3 py-2 rounded-lg text-center">
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-3">{activity.title}</h4>
                          <p className="text-gray-600 mb-4 leading-relaxed">{activity.description}</p>
                          {activity.location && (
                            <div className="flex items-center gap-2 text-gray-500 mb-3">
                              <MapPin size={14} />
                              <span className="text-sm">{activity.location}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {activity.ecoFeatures?.map((feature, featureIdx) => (
                              <span key={featureIdx} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600 mb-1">
                            {activity.carbonFootprint}kg CO₂
                          </div>
                          <div className="text-sm text-gray-500">
                            Carbon Impact
                          </div>
                        </div>
                      </div>
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
                  <div key={hotel.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {hotel.image && (
                      <div className="h-64 bg-gray-200 overflow-hidden">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                          <p className="text-gray-600 flex items-center gap-2">
                            <MapPin size={16} />
                            {hotel.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-2">
                            <Star size={18} className="text-yellow-400" />
                            <span className="text-lg font-semibold">{hotel.rating}</span>
                          </div>
                          <div className="text-sm text-emerald-600 font-semibold">
                            Eco: {hotel.sustainabilityScore}/5
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6 leading-relaxed">{hotel.description}</p>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Eco Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {hotel.ecoFeatures?.map((feature, idx) => (
                              <span key={idx} className="text-sm bg-emerald-100 text-emerald-700 px-3 py-2 rounded-full font-medium">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
                          <div className="flex flex-wrap gap-2">
                            {hotel.amenities?.map((amenity, idx) => (
                              <span key={idx} className="text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-full font-medium">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="text-sm">
                            <span className="text-gray-600">Distance: </span>
                            <span className="font-semibold">{hotel.distance?.value} {hotel.distance?.unit}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Carbon: </span>
                            <span className="font-semibold text-green-600">{hotel.carbonFootprint}kg CO₂</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Building2 size={48} className="mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Accommodations Listed</h3>
                  <p className="text-gray-500">Accommodation details are not available for this itinerary.</p>
                </div>
              </div>
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
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Car size={48} className="mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Transport Options Listed</h3>
                  <p className="text-gray-500">Transport information is not available for this itinerary.</p>
                </div>
              </div>
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

            {/* Day Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Select Day to View</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {itinerary.days?.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => {
                      setSelectedDay(day.day)
                      displayDayOnMap(day.day)
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${selectedDay === day.day
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-lg mb-1">Day {day.day}</div>
                      <div className="text-sm mb-2">{day.theme}</div>
                      <div className="text-xs text-gray-500">
                        {day.activities?.length || 0} activities
                      </div>
                      <div className="text-xs text-emerald-600 font-medium mt-1">
                        Eco: {day.sustainabilityScore}/5
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

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
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
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
    </div>
  )
}
