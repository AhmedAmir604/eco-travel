// Google Maps API integration for discovering low-carbon transport methods in areas

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const MAPS_API_BASE = 'https://maps.googleapis.com/maps/api'

// 🚀 OPTIMIZATION: Add caching for API responses
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// 🚀 OPTIMIZATION: Request debouncing
let debounceTimer = null

// Transport types to search for with their eco-friendliness
const TRANSPORT_TYPES = {
  // Zero emission transport
  // bicycle_store: { name: 'Bike Rentals & Sharing', ecoScore: 5, carbonFactor: 0, icon: '🚴' },

  // Public transit (low emission)
  transit_station: { name: 'Public Transit Stations', ecoScore: 4, carbonFactor: 0.041, icon: '🚌' },
  subway_station: { name: 'Metro/Subway Stations', ecoScore: 4, carbonFactor: 0.035, icon: '🚇' },
  train_station: { name: 'Train Stations', ecoScore: 5, carbonFactor: 0.025, icon: '🚂' },
  bus_station: { name: 'Bus Stations', ecoScore: 4, carbonFactor: 0.089, icon: '🚌' },

  // Shared transport
  taxi_stand: { name: 'Taxi Stands (Shared)', ecoScore: 2, carbonFactor: 0.15, icon: '🚕' },

  // Electric transport
  electric_vehicle_charging_station: { name: 'EV Charging Stations', ecoScore: 3, carbonFactor: 0.053, icon: '⚡' }
}

// Area-specific transport discovery
export async function discoverAreaTransport(location, radius = 5000) {
  try {
    // First, geocode the location to get coordinates
    let coordinates
    try {
      if (typeof location === 'string' && !location.includes(',')) {
        // If it's an address, geocode it first
        const geocoded = await geocodeAddress(location)


        coordinates = `${geocoded.location.lat},${geocoded.location.lng}`
        console.log(`Geocoded "${location}" to coordinates:`, coordinates)
      } else {
        // Assume it's already coordinates
        coordinates = location
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
      throw new Error(`Could not find location: ${location}`)
    }

    // 🚀 OPTIMIZATION: Search all transport types in parallel instead of sequentially
    console.log(`🔍 Searching ${Object.keys(TRANSPORT_TYPES).length} transport types in parallel...`)

    const searchPromises = Object.entries(TRANSPORT_TYPES).map(async ([placeType, config]) => {
      try {
        const places = await findNearbyPlaces(coordinates, placeType, radius)

        if (places.length > 0) {
          console.log(`✅ Found ${places.length} ${placeType} locations`)
          return {
            type: placeType,
            name: config.name,
            icon: config.icon,
            ecoScore: config.ecoScore,
            carbonFactor: config.carbonFactor,
            count: places.length,
            places: places.slice(0, 5), // Reduced from 10 to 5 for faster loading
            description: getTransportDescription(config),
            availability: 'Available in area'
          }
        }
        return null
      } catch (error) {
        console.error(`❌ Error finding ${placeType}:`, error)
        return null
      }
    })

    // Wait for all searches to complete in parallel
    const searchResults = await Promise.all(searchPromises)
    const results = searchResults.filter(result => result !== null)


    // Sort by eco-friendliness (highest score first)
    return results.sort((a, b) => b.ecoScore - a.ecoScore)

  } catch (error) {
    console.error('Error discovering area transport:', error)
    return []
  }
}

// Get detailed information about specific transport type in area
export async function getTransportDetails(location, transportType, radius = 3000) {
  try {
    // First, geocode the location to get coordinates
    let coordinates
    try {
      if (typeof location === 'string' && !location.includes(',')) {
        const geocoded = await geocodeAddress(location)
        coordinates = `${geocoded.location.lat},${geocoded.location.lng}`
      } else {
        coordinates = location
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
      throw new Error(`Could not find location: ${location}`)
    }

    const places = await findNearbyPlaces(coordinates, transportType, radius)
    const config = TRANSPORT_TYPES[transportType]

    if (!config) {
      throw new Error(`Unknown transport type: ${transportType}`)
    }

    return {
      type: transportType,
      name: config.name,
      icon: config.icon,
      ecoScore: config.ecoScore,
      carbonFactor: config.carbonFactor,
      places: places.map(place => ({
        ...place,
        ecoRating: config.ecoScore,
        estimatedEmissions: `${config.carbonFactor} kg CO₂/km`,
        walkingDistance: 'Calculating...' // Could add walking distance to each
      })),
      totalCount: places.length,
      description: getTransportDescription(config),
      ecoImpact: getEcoImpact(config.carbonFactor),
      recommendations: getAreaRecommendations(config, places.length)
    }
  } catch (error) {
    console.error('Error getting transport details:', error)
    throw error
  }
}

// Get directions from Google Maps API
async function getDirections(origin, destination, mode) {
  const params = new URLSearchParams({
    origin,
    destination,
    mode: mode.toLowerCase(),
    key: GOOGLE_MAPS_API_KEY,
    units: 'metric'
  })

  if (mode === 'TRANSIT') {
    params.append('transit_mode', 'bus|subway|train|tram')
    params.append('transit_routing_preference', 'fewer_transfers')
  }

  const response = await fetch(`${MAPS_API_BASE}/directions/json?${params}`)
  const data = await response.json()

  if (data.status !== 'OK' || !data.routes.length) {
    return null
  }

  const route = data.routes[0]
  const leg = route.legs[0]

  return {
    distance: leg.distance.value / 1000, // Convert to km
    duration: leg.duration.text,
    durationValue: leg.duration.value / 60, // Convert to minutes
    distanceText: leg.distance.text,
    startAddress: leg.start_address,
    endAddress: leg.end_address,
    steps: parseSteps(leg.steps, mode),
    polyline: route.overview_polyline.points
  }
}

// Parse route steps for detailed instructions
function parseSteps(steps, mode) {
  return steps.map(step => ({
    instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || '',
    distance: step.distance?.text || '',
    duration: step.duration?.text || '',
    travelMode: step.travel_mode,
    transitDetails: mode === 'TRANSIT' ? parseTransitDetails(step) : null
  }))
}

// Parse transit-specific details
function parseTransitDetails(step) {
  if (!step.transit_details) return null

  return {
    line: step.transit_details.line?.name || '',
    vehicle: step.transit_details.line?.vehicle?.name || '',
    departureStop: step.transit_details.departure_stop?.name || '',
    arrivalStop: step.transit_details.arrival_stop?.name || '',
    departureTime: step.transit_details.departure_time?.text || '',
    arrivalTime: step.transit_details.arrival_time?.text || '',
    numStops: step.transit_details.num_stops || 0,
    headsign: step.transit_details.headsign || ''
  }
}

// Calculate carbon emissions
function calculateEmissions(distanceKm, mode) {
  const factor = EMISSION_FACTORS[mode] || 0
  return Math.round(distanceKm * factor * 100) / 100
}

// Get eco-friendly recommendation
function getEcoRecommendation(route, mode) {
  const { distance, durationValue } = route

  switch (mode) {
    case 'WALKING':
      if (distance < 2) return 'Perfect for short trips! Zero emissions and great exercise.'
      if (distance < 5) return 'Excellent choice for medium distances. Completely carbon-free!'
      return 'Long walk but amazing for the environment and your health!'

    case 'BICYCLING':
      if (distance < 5) return 'Ideal cycling distance! Fast, fun, and zero emissions.'
      if (distance < 15) return 'Great cycling route! Much faster than walking, still zero carbon.'
      return 'Long cycling adventure! Perfect for eco-conscious travelers.'

    case 'TRANSIT':
      if (durationValue < 30) return 'Quick and eco-friendly! Public transit is great for the planet.'
      if (durationValue < 60) return 'Efficient public transport with low carbon footprint.'
      return 'Longer journey but much better for the environment than driving!'

    default:
      return 'Eco-friendly transport option!'
  }
}

// Helper functions for transport discovery
function getTransportDescription(config) {
  const descriptions = {
    5: 'Excellent eco-friendly choice! Zero or ultra-low emissions.',
    4: 'Great sustainable option with low carbon footprint.',
    3: 'Good eco-friendly alternative, especially when shared.',
    2: 'Moderate environmental impact, better when shared.',
    1: 'Higher emissions, use only when necessary.'
  }
  return descriptions[config.ecoScore] || 'Transport option available.'
}

function getEcoImpact(carbonFactor) {
  if (carbonFactor === 0) return 'Zero emissions - Perfect for the environment!'
  if (carbonFactor < 0.05) return 'Ultra-low emissions - Excellent eco choice!'
  if (carbonFactor < 0.1) return 'Low emissions - Great for sustainable travel!'
  if (carbonFactor < 0.2) return 'Moderate emissions - Good shared transport option!'
  return 'Higher emissions - Consider alternatives when possible.'
}

function getAreaRecommendations(config, count) {
  const recommendations = []

  if (config.ecoScore === 5) {
    recommendations.push('Highly recommended for eco-conscious travelers!')
    if (count > 5) recommendations.push('Great availability in this area!')
  }

  if (config.ecoScore === 4) {
    recommendations.push('Excellent public transport option!')
    if (count > 10) recommendations.push('Well-connected area with good coverage!')
  }

  if (config.carbonFactor === 0) {
    recommendations.push('Zero emissions - perfect for short to medium trips!')
  }

  return recommendations
}

async function getCyclingRouteCount(location) {
  // This would ideally check for bike lanes, cycling paths, etc.
  // For now, return a general assessment
  return 'Check local bike infrastructure'
}

// Find nearby places using Google Places API with caching
async function findNearbyPlaces(location, type, radius = 3000) {
  try {
    // Check if API key is available
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
      console.warn('Google Maps API key not configured')
      return []
    }

    // 🚀 OPTIMIZATION: Check cache first
    const cacheKey = `${location}-${type}-${radius}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`💾 Using cached data for ${type}`)
      return cached.data
    }

    const params = new URLSearchParams({
      location,
      radius: radius.toString(),
      type,
      key: GOOGLE_MAPS_API_KEY
    })

    // console.log(`Making API request: ${MAPS_API_BASE}/place/nearbysearch/json?${params}`)

    const response = await fetch(`${MAPS_API_BASE}/place/nearbysearch/json?${params}`)
    const data = await response.json()

    // console.log(`API Response for ${type}:`, {
    //   status: data.status,
    //   resultsCount: data.results?.length || 0,
    //   errorMessage: data.error_message
    // })

    if (data.status === 'REQUEST_DENIED') {
      console.error('Google Maps API request denied:', data.error_message)
      return []
    }

    if (data.status === 'INVALID_REQUEST') {
      console.error('Invalid request to Google Maps API:', data.error_message)
      return []
    }

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`Google Maps API error: ${data.status} - ${data.error_message}`)
      return []
    }

    if (!data.results || data.results.length === 0) {
      // console.log(`No results found for ${type} at ${location}`)
      return []
    }

    const results = data.results.map(place => ({
      placeId: place.place_id,
      name: place.name,
      vicinity: place.vicinity,
      rating: place.rating || 'N/A',
      openNow: place.opening_hours?.open_now,
      location: place.geometry.location,
      types: place.types,
      priceLevel: place.price_level,
      userRatingsTotal: place.user_ratings_total || 0,
      photos: place.photos ? place.photos.slice(0, 1).map(photo => ({
        photoReference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        url: getPlacePhotoUrl(photo.photo_reference, 300, 200) // Smaller size for faster loading
      })) : []
    }))

    // 🚀 OPTIMIZATION: Cache the results
    cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    })

    return results
  } catch (error) {
    console.error('Error finding nearby places:', error)
    return []
  }
}

// Get area transport summary with statistics
export async function getAreaTransportSummary(location, radius = 5000) {
  try {
    const transportOptions = await discoverAreaTransport(location, radius)

    const summary = {
      location,
      radius: `${radius / 1000}km`,
      totalTransportTypes: transportOptions.length,
      ecoFriendlyOptions: transportOptions.filter(t => t.ecoScore >= 4).length,
      zeroEmissionOptions: transportOptions.filter(t => t.carbonFactor === 0).length,
      bestOptions: transportOptions.slice(0, 3),
      coverage: {
        excellent: transportOptions.filter(t => t.ecoScore === 5).length,
        good: transportOptions.filter(t => t.ecoScore === 4).length,
        moderate: transportOptions.filter(t => t.ecoScore === 3).length,
        limited: transportOptions.filter(t => t.ecoScore <= 2).length
      },
      recommendations: generateAreaRecommendations(transportOptions)
    }

    return summary
  } catch (error) {
    console.error('Error getting area summary:', error)
    throw error
  }
}

function generateAreaRecommendations(transportOptions) {
  const recommendations = []

  const zeroEmission = transportOptions.filter(t => t.carbonFactor === 0)
  const publicTransit = transportOptions.filter(t => t.type.includes('station') || t.type.includes('transit'))
  const bikeOptions = transportOptions.filter(t => t.type.includes('bicycle'))

  if (zeroEmission.length >= 2) {
    recommendations.push('🌟 Excellent area for zero-emission transport!')
  }

  if (publicTransit.length >= 3) {
    recommendations.push('🚌 Well-connected public transport network!')
  }

  if (bikeOptions.length > 0) {
    recommendations.push('🚴 Bike-friendly area with rental options!')
  }

  if (transportOptions.filter(t => t.ecoScore >= 4).length >= 4) {
    recommendations.push('🌱 Great eco-friendly transport coverage!')
  }

  return recommendations
}

// Geocode address to coordinates
export async function geocodeAddress(address) {
  try {
    const params = new URLSearchParams({
      address,
      key: GOOGLE_MAPS_API_KEY
    })

    const response = await fetch(`${MAPS_API_BASE}/geocode/json?${params}`)
    const data = await response.json()
    // console.log("geo: ",data);
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error('Address not found')
    }

    const result = data.results[0]
    return {
      address: result.formatted_address,
      location: result.geometry.location,
      placeId: result.place_id
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    throw error
  }
}
// Get
//  Google Places photo URL
export function getPlacePhotoUrl(photoReference, maxWidth = 400, maxHeight = 300) {
  if (!photoReference || !GOOGLE_MAPS_API_KEY) return null

  return `${MAPS_API_BASE}/place/photo?maxwidth=${maxWidth}&maxheight=${maxHeight}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`
}