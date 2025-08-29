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
        // console.log(`Geocoded "${location}" to coordinates:`, coordinates)
      } else {
        // Assume it's already coordinates
        coordinates = location
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
      throw new Error(`Could not find location: ${location}`)
    }

    // 🚀 OPTIMIZATION: Search all transport types in parallel instead of sequentially
    // console.log(`🔍 Searching ${Object.keys(TRANSPORT_TYPES).length} transport types in parallel...`)

    const searchPromises = Object.entries(TRANSPORT_TYPES).map(async ([placeType, config]) => {
      try {
        const places = await findNearbyPlaces(coordinates, placeType, radius)

        if (places.length > 0) {
          // console.log(`✅ Found ${places.length} ${placeType} locations`)

          // Get the best image from the first place with photos
          let mainImage = null
          const placeWithPhoto = places.find(place => place.photos && place.photos.length > 0)
          if (placeWithPhoto) {
            mainImage = placeWithPhoto.photos[0].url
          }

          return {
            type: placeType,
            name: config.name,
            icon: config.icon,
            ecoScore: config.ecoScore,
            carbonFactor: config.carbonFactor,
            count: places.length,
            places: places.slice(0, 5).map(place => ({
              ...place,
              image: place.photos && place.photos.length > 0 ? place.photos[0].url : null
            })),
            description: getTransportDescription(config),
            availability: 'Available in area',
            image: mainImage
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
      // console.log(`💾 Using cached data for ${type}`)
      return cached.data
    }

    let response, data

    // Special handling for transport types that need text search for better results
    if (type === 'electric_vehicle_charging_station') {
      const params = new URLSearchParams({
        query: 'electric vehicle charging station',
        location,
        radius: radius.toString(),
        key: GOOGLE_MAPS_API_KEY
      })

      console.log(`Making EV charging station text search: ${MAPS_API_BASE}/place/textsearch/json?${params}`)
      response = await fetch(`${MAPS_API_BASE}/place/textsearch/json?${params}`)
      data = await response.json()
    } else if (type === 'transit_station' || type === 'bus_station') {
      // Use text search for transit stations to get better results
      const searchQueries = {
        'transit_station': 'bus station metro station transit',
        'bus_station': 'bus station bus terminal'
      }
      
      const params = new URLSearchParams({
        query: searchQueries[type],
        location,
        radius: radius.toString(),
        key: GOOGLE_MAPS_API_KEY
      })

      console.log(`Making transit station text search: ${MAPS_API_BASE}/place/textsearch/json?${params}`)
      response = await fetch(`${MAPS_API_BASE}/place/textsearch/json?${params}`)
      data = await response.json()
    } else {
      // Use regular nearby search for other transport types
      const params = new URLSearchParams({
        location,
        radius: radius.toString(),
        type,
        key: GOOGLE_MAPS_API_KEY
      })

      console.log(`Making API request: ${MAPS_API_BASE}/place/nearbysearch/json?${params}`)
      response = await fetch(`${MAPS_API_BASE}/place/nearbysearch/json?${params}`)
      data = await response.json()
    }

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

    // Filter results to ensure they're actually the correct transport type
    let filteredResults = data.results
    
    if (type === 'electric_vehicle_charging_station') {
      filteredResults = data.results.filter(place => {
        const name = place.name.toLowerCase()
        const types = place.types || []
        const businessStatus = place.business_status

        // Check if it's actually an EV charging station
        const isEVStation = name.includes('charging') ||
          name.includes('electric') ||
          name.includes('ev ') ||
          name.includes('tesla') ||
          name.includes('supercharger') ||
          types.some(type => type.includes('gas_station') && name.includes('electric'))

        // Exclude permanently closed places
        const isOpen = businessStatus !== 'CLOSED_PERMANENTLY'

        return isEVStation && isOpen
      })

      console.log(`Filtered EV stations: ${filteredResults.length} out of ${data.results.length} results`)
    } else if (type === 'transit_station' || type === 'bus_station') {
      filteredResults = data.results.filter(place => {
        const name = place.name.toLowerCase()
        const types = place.types || []
        const businessStatus = place.business_status
        
        // Check if it's actually a transit/bus station
        const isTransitStation = name.includes('station') || 
                                name.includes('terminal') || 
                                name.includes('bus') ||
                                name.includes('metro') ||
                                name.includes('transit') ||
                                name.includes('orange line') ||
                                name.includes('metrobus') ||
                                types.some(t => t.includes('transit_station') || 
                                              t.includes('bus_station') || 
                                              t.includes('subway_station') ||
                                              t.includes('train_station'))
        
        // Exclude non-transport places like McDonald's, markets, etc.
        const isNotGenericPlace = !name.includes('mcdonald') &&
                                 !name.includes('market') &&
                                 !name.includes('road') &&
                                 !name.includes('mess') &&
                                 !name.includes('brothers') &&
                                 !types.some(t => t.includes('restaurant') || 
                                                t.includes('store') || 
                                                t.includes('establishment'))
        
        // Exclude permanently closed places
        const isOpen = businessStatus !== 'CLOSED_PERMANENTLY'
        
        return isTransitStation && isNotGenericPlace && isOpen
      })
      
      console.log(`Filtered transit stations: ${filteredResults.length} out of ${data.results.length} results`)
    }

    const results = filteredResults.map(place => ({
      placeId: place.place_id,
      name: place.name,
      vicinity: place.vicinity || place.formatted_address,
      rating: place.rating || 'N/A',
      openNow: place.opening_hours?.open_now,
      location: place.geometry.location,
      types: place.types,
      priceLevel: place.price_level,
      userRatingsTotal: place.user_ratings_total || 0,
      businessStatus: place.business_status,
      photos: place.photos ? place.photos.slice(0, 1).map(photo => ({
        photoReference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        url: getPlacePhotoUrl(photo.photo_reference, 300, 200) // Smaller size for faster loading
      })) : []
    }))

    // If search returned few results, try alternative searches
    if ((type === 'electric_vehicle_charging_station' || type === 'transit_station' || type === 'bus_station') && results.length < 3) {
      // console.log(`${type} search returned few results, trying alternative searches...`)

      let alternativeQueries = []
      
      if (type === 'electric_vehicle_charging_station') {
        alternativeQueries = [
          'EV charging station',
          'Tesla charging',
          'electric car charging',
          'charging point'
        ]
      } else if (type === 'transit_station') {
        alternativeQueries = [
          'metro station',
          'bus terminal',
          'public transport station',
          'orange line station',
          'metrobus station'
        ]
      } else if (type === 'bus_station') {
        alternativeQueries = [
          'bus terminal',
          'bus depot',
          'bus stand',
          'city bus station'
        ]
      }

      for (const query of alternativeQueries) {
        try {
          const altParams = new URLSearchParams({
            query,
            location,
            radius: radius.toString(),
            key: GOOGLE_MAPS_API_KEY
          })

          const altResponse = await fetch(`${MAPS_API_BASE}/place/textsearch/json?${altParams}`)
          const altData = await altResponse.json()

          if (altData.status === 'OK' && altData.results.length > 0) {
            let altFiltered = []
            
            if (type === 'electric_vehicle_charging_station') {
              altFiltered = altData.results.filter(place => {
                const name = place.name.toLowerCase()
                const isEVStation = name.includes('charging') ||
                  name.includes('electric') ||
                  name.includes('ev ') ||
                  name.includes('tesla') ||
                  name.includes('supercharger')
                const isOpen = place.business_status !== 'CLOSED_PERMANENTLY'
                const notDuplicate = !results.some(existing => existing.placeId === place.place_id)

                return isEVStation && isOpen && notDuplicate
              })
            } else {
              altFiltered = altData.results.filter(place => {
                const name = place.name.toLowerCase()
                const types = place.types || []
                
                const isTransitStation = name.includes('station') || 
                                        name.includes('terminal') || 
                                        name.includes('bus') ||
                                        name.includes('metro') ||
                                        name.includes('transit') ||
                                        name.includes('orange line') ||
                                        types.some(t => t.includes('transit_station') || 
                                                      t.includes('bus_station') || 
                                                      t.includes('subway_station'))
                
                const isNotGenericPlace = !name.includes('mcdonald') &&
                                         !name.includes('market') &&
                                         !name.includes('road') &&
                                         !name.includes('mess') &&
                                         !types.some(t => t.includes('restaurant') || t.includes('store'))
                
                const isOpen = place.business_status !== 'CLOSED_PERMANENTLY'
                const notDuplicate = !results.some(existing => existing.placeId === place.place_id)
                
                return isTransitStation && isNotGenericPlace && isOpen && notDuplicate
              })
            }

            const altResults = altFiltered.map(place => ({
              placeId: place.place_id,
              name: place.name,
              vicinity: place.vicinity || place.formatted_address,
              rating: place.rating || 'N/A',
              openNow: place.opening_hours?.open_now,
              location: place.geometry.location,
              types: place.types,
              priceLevel: place.price_level,
              userRatingsTotal: place.user_ratings_total || 0,
              businessStatus: place.business_status,
              photos: place.photos ? place.photos.slice(0, 1).map(photo => ({
                photoReference: photo.photo_reference,
                width: photo.width,
                height: photo.height,
                url: getPlacePhotoUrl(photo.photo_reference, 300, 200)
              })) : []
            }))

            results.push(...altResults)

            if (results.length >= 10) break // Stop if we have enough results
          }
        } catch (error) {
          console.error(`Error in alternative EV search for "${query}":`, error)
        }
      }
    }

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


    if (data.status !== 'OK' || !data.results.length) {
      // Try with fallback coordinates for common cities
      const fallbackCoordinates = getFallbackCoordinates(address)
      if (fallbackCoordinates) {
        console.log('Using fallback coordinates for:', address)
        return fallbackCoordinates
      }
      throw new Error(`Address not found: ${address} (Status: ${data.status})`)
    }

    const result = data.results[0]
    return {
      address: result.formatted_address,
      location: result.geometry.location,
      placeId: result.place_id
    }
  } catch (error) {
    console.error('Geocoding error:', error)

    // Try fallback coordinates as last resort
    const fallbackCoordinates = getFallbackCoordinates(address)
    if (fallbackCoordinates) {
      console.log('Using fallback coordinates after error for:', address)
      return fallbackCoordinates
    }

    throw error
  }
}

// Fallback coordinates for major cities
function getFallbackCoordinates(address) {
  const fallbacks = {
    'karachi': {
      address: 'Karachi, Pakistan',
      location: { lat: 24.8607343, lng: 67.0011364 },
      placeId: 'ChIJv0sdZQY-sz4RIwxaVVQv-Qs'
    },
    'lahore': {
      address: 'Lahore, Pakistan',
      location: { lat: 31.5203696, lng: 74.35874729999999 },
      placeId: 'ChIJP-XnKWIGGTkRbQ8MrKOOSQE'
    },
    'islamabad': {
      address: 'Islamabad, Pakistan',
      location: { lat: 33.6844202, lng: 73.04788479999999 },
      placeId: 'ChIJH8uKqOLG3zgRZqaWVVmz_Qs'
    },
    'paris': {
      address: 'Paris, France',
      location: { lat: 48.856614, lng: 2.3522219 },
      placeId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ'
    },
    'london': {
      address: 'London, UK',
      location: { lat: 51.5073509, lng: -0.1277583 },
      placeId: 'ChIJdd4hrwug2EcRmSrV3Vo6llI'
    },
    'new york': {
      address: 'New York, NY, USA',
      location: { lat: 40.7127753, lng: -74.0059728 },
      placeId: 'ChIJOwg_06VPwokRYv534QaPC8g'
    }
  }

  const normalizedAddress = address.toLowerCase().trim()

  // Check for exact matches first
  if (fallbacks[normalizedAddress]) {
    return fallbacks[normalizedAddress]
  }

  // Check for partial matches
  for (const [city, coords] of Object.entries(fallbacks)) {
    if (normalizedAddress.includes(city) || city.includes(normalizedAddress)) {
      return coords
    }
  }

  return null
}
// Get Google Places photo URL
export function getPlacePhotoUrl(photoReference, maxWidth = 400, maxHeight = 300) {
  if (!photoReference || !GOOGLE_MAPS_API_KEY) return null

  return `${MAPS_API_BASE}/place/photo?maxwidth=${maxWidth}&maxheight=${maxHeight}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`
}

// Get transport type specific images
export async function getTransportImages(transportType, location) {
  try {
    const searchQueries = {
      train_station: 'railway station',
      subway_station: 'metro station',
      bus_station: 'bus station',
      transit_station: 'bus stop',
      electric_vehicle_charging_station: 'EV charging station'
    }

    const query = searchQueries[transportType] || transportType.replace('_', ' ')

    const params = new URLSearchParams({
      query: `${query} ${location}`,
      key: GOOGLE_MAPS_API_KEY,
      fields: 'photos,name,place_id,formatted_address'
    })

    const response = await fetch(`${MAPS_API_BASE}/place/textsearch/json?${params}`)
    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      const place = data.results[0]
      if (place.photos && place.photos.length > 0) {
        return {
          mainImage: getPlacePhotoUrl(place.photos[0].photo_reference, 400, 300),
          thumbnails: place.photos.slice(0, 3).map(photo =>
            getPlacePhotoUrl(photo.photo_reference, 200, 150)
          )
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching transport images:', error)
    return null
  }
}