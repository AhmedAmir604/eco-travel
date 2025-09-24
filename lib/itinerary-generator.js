import { amadeusAPI } from './amadeus'
import { discoverAreaTransport, geocodeAddress } from './google-maps-transport'

// OpenTripMap API configuration
const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY
const OPENTRIPMAP_BASE = 'https://api.opentripmap.com/0.1/en/places'

// Climatiq API configuration  
const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY
const CLIMATIQ_BASE = 'https://beta3.api.climatiq.io'

// Interest categories mapping to OpenTripMap categories
const INTEREST_CATEGORIES = {
  culture: ['museums', 'historic', 'architecture', 'cultural'],
  nature: ['natural', 'geological', 'sport'],
  food: ['foods', 'shops'],
  adventure: ['sport', 'amusements'],
  history: ['historic', 'museums', 'architecture'],
  art: ['museums', 'cultural', 'architecture'],
  nightlife: ['amusements', 'foods'],
  shopping: ['shops'],
  wellness: ['sport', 'natural']
}

// Sustainability scoring factors
const SUSTAINABILITY_FACTORS = {
  transport: {
    walking: 5,
    cycling: 5,
    public_transit: 4,
    electric_vehicle: 3,
    hybrid: 2,
    conventional: 1
  },
  accommodation: {
    'eco-certified': 5,
    'green-hotel': 4,
    'boutique': 3,
    'standard': 2,
    'luxury': 1
  },
  activities: {
    'nature-based': 5,
    'cultural': 4,
    'local-community': 4,
    'educational': 4,
    'adventure': 3,
    'shopping': 2,
    'nightlife': 1
  }
}

export async function generatePersonalizedItinerary(preferences) {
  const {
    destination,
    duration,
    travelers,
    interests = ['culture'],
    budget = 'medium',
    accommodationType = 'eco-hotel',
    transportPreference = 'public',
    sustainabilityLevel = 'high'
  } = preferences

  try {
    // console.log(`🌱 Generating eco-friendly itinerary for ${destination}...`)

    // Step 1: Geocode destination and get coordinates
    const locationData = await geocodeAddress(destination)
    const coordinates = locationData.location

    // console.log("cordinates: itenerary", coordinates);

    // Step 2: Generate itinerary structure
    const itinerary = {
      id: `itinerary-${Date.now()}`,
      title: `Eco-Friendly ${locationData.address} Adventure`,
      destination: locationData.address,
      coordinates,
      duration,
      travelers,
      preferences: {
        interests,
        budget,
        accommodationType,
        transportPreference,
        sustainabilityLevel
      },
      days: [],
      accommodations: [],
      transport: [],
      sustainability: {
        totalCarbonSaved: 0,
        ecoScore: 0,
        sustainabilityFeatures: []
      },
      summary: {
        totalCost: 0,
        highlights: [],
        ecoFriendlyActivities: 0
      }
    }

    // Step 3: Find eco-friendly accommodations
    // console.log('🏨 Finding eco-friendly accommodations...')
    itinerary.accommodations = await findEcoAccommodations(destination, duration, travelers)

    // console.log("itenerary accomodations:", itinerary.accommodations);

    // Step 4: Discover sustainable transport options
    // console.log('🚌 Discovering sustainable transport...')
    itinerary.transport = await findSustainableTransport(coordinates, transportPreference)

    // console.log("itinerary transport: ", itinerary.transport)

    // Step 5: Generate daily activities based on interests
    // console.log('🎯 Generating personalized activities...')
    itinerary.days = await generateDailyActivities(
      coordinates,
      duration,
      interests,
      sustainabilityLevel,
      budget
    )

    console.log("outer acitivies opentrimap", itinerary.days);

    // Step 6: Calculate sustainability metrics
    console.log('📊 Calculating sustainability metrics...')
    itinerary.sustainability = await calculateSustainabilityMetrics(itinerary)

    console.log("itinerary sustainibility:", itinerary.sustainability);
    // Step 7: Generate summary and recommendations
    itinerary.summary = generateItinerarySummary(itinerary)

    console.log(`✅ Generated ${duration}-day eco-friendly itinerary with ${itinerary.days.length} days of activities`)

    return itinerary

  } catch (error) {
    console.error('Error generating itinerary:', error)
    throw new Error(`Failed to generate itinerary: ${error.message}`)
  }
}

async function findEcoAccommodations(destination, duration, travelers) {
  try {
    // Use Amadeus API to find hotels
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7) // 7 days from now
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + duration)

    const hotels = await amadeusAPI.searchHotels(
      destination,
      checkIn.toISOString().split('T')[0],
      checkOut.toISOString().split('T')[0],
      travelers
    )

    // Filter and enhance with eco-features
    return hotels.slice(0, 3).map(hotel => ({
      ...hotel,
      sustainabilityScore: calculateAccommodationSustainability(hotel),
      ecoFeatures: generateEcoFeatures(hotel),
      carbonFootprint: calculateAccommodationCarbon(hotel, duration)
    }))

  } catch (error) {
    console.error('Error finding accommodations:', error)
    return []
  }
}

async function findSustainableTransport(coordinates, preference) {
  try {
    const location = `${coordinates.lat},${coordinates.lng}`
    const transportOptions = await discoverAreaTransport(location, 5000)

    // Filter based on preference and sustainability
    const sustainableOptions = transportOptions
      .filter(option => option.ecoScore >= 3)
      .sort((a, b) => b.ecoScore - a.ecoScore)
      .slice(0, 5)

    return sustainableOptions.map(option => ({
      ...option,
      recommendation: getTransportRecommendation(option, preference),
      carbonSavings: calculateTransportCarbonSavings(option)
    }))

  } catch (error) {
    console.error('Error finding transport:', error)
    return []
  }
}

async function generateDailyActivities(coordinates, duration, interests, sustainabilityLevel, budget) {
  const days = []

  // Fetch all POIs once and distribute them across days
  // console.log('🎯 Fetching all POIs for the trip...')
  const allPois = await getPointsOfInterest(coordinates, interests, sustainabilityLevel)
  // console.log(`Total POIs found for entire trip: ${allPois.length}`)

  // Shuffle and distribute POIs across days
  const shuffledPois = [...allPois].sort(() => 0.5 - Math.random())
  const poisPerDay = Math.ceil(shuffledPois.length / duration)

  for (let day = 1; day <= duration; day++) {
    console.log(`📅 Planning day ${day}...`)

    // Get unique POIs for this day
    const startIndex = (day - 1) * poisPerDay
    const endIndex = startIndex + poisPerDay
    const dayPois = shuffledPois.slice(startIndex, endIndex)

    const dayActivities = await generateDayActivities(
      coordinates,
      interests,
      sustainabilityLevel,
      budget,
      day,
      dayPois // Pass the specific POIs for this day
    )

    days.push({
      day,
      date: getDateForDay(day),
      theme: getDayTheme(day, interests),
      activities: dayActivities,
      sustainabilityScore: calculateDaySustainability(dayActivities),
      estimatedCost: calculateDayCost(dayActivities, budget),
      carbonFootprint: calculateDayCarbon(dayActivities)
    })
  }

  return days
}

async function generateDayActivities(coordinates, interests, sustainabilityLevel, budget, dayNumber, dayPois = []) {
  const activities = []

  try {
    // Use the pre-assigned POIs for this day
    const pois = dayPois

    console.log(`Day ${dayNumber} POIs assigned:`, pois.length)
    if (pois.length > 0) {
      console.log(`POIs for day ${dayNumber}:`, pois.map(p => ({ name: p.name, rating: p.rating, kinds: p.kinds })))
    } else {
      console.log(`No POIs assigned for day ${dayNumber}, will use fallback activities`)
    }

    if (pois.length > 0) {
      // Sort POIs by rating to get the best ones first
      const sortedPois = pois.sort((a, b) => (b.rating || 0) - (a.rating || 0))

      // Create diverse activities based on available POIs
      const timeSlots = ['09:00', '11:30', '14:00', '16:30']

      // Create up to 4 activities per day using available POIs (save evening for dining)
      const numActivities = Math.min(sortedPois.length, 4)

      for (let i = 0; i < numActivities; i++) {
        const poi = sortedPois[i]
        const time = timeSlots[i] || '10:00'

        // Determine activity type based on POI categories
        let activityType = 'cultural'
        const kindsStr = poi.kinds || ''
        if (kindsStr.includes('museums')) activityType = 'cultural'
        else if (kindsStr.includes('historic')) activityType = 'cultural'
        else if (kindsStr.includes('natural')) activityType = 'nature'
        else if (kindsStr.includes('foods')) activityType = 'food'
        else if (kindsStr.includes('shops')) activityType = 'shopping'
        else if (kindsStr.includes('sport')) activityType = 'nature'
        else if (kindsStr.includes('architecture')) activityType = 'cultural'

        // Use real description from API or generate enhanced one
        let description = poi.description || await generateEnhancedDescription(poi, activityType, sustainabilityLevel)

        // Calculate more realistic carbon footprint based on activity type and sustainability level
        const carbonFootprint = calculateActivityCarbon(activityType, sustainabilityLevel, poi.kinds)

        // Calculate sustainability score based on activity type and features
        const sustainabilityScore = calculateActivitySustainability(activityType, poi.kinds, sustainabilityLevel)

        activities.push({
          time: time,
          type: activityType,
          title: poi.name,
          description: description,
          location: poi.address || poi.location || `${poi.name} area`,
          duration: getDurationByActivityType(activityType, i),
          cost: getBudgetCost(activityType === 'food' ? 'dining' : 'activity', budget),
          carbonFootprint: carbonFootprint,
          sustainabilityScore: sustainabilityScore,
          ecoFeatures: getEcoFeaturesForActivity(activityType, poi.kindsArray || poi.kinds),
          coordinates: poi.coordinates,
          rating: poi.rating || 4.0,
          // Add real data fields
          wikidata: poi.wikidata,
          wikipedia: poi.wikipedia,
          image: poi.image,
          kindsArray: poi.kindsArray || (poi.kinds ? poi.kinds.split(',').map(k => k.trim()) : []),
          url: poi.url
        })
      }
    }

    // Evening activity (food/local experience) - always add this
    const eveningActivity = {
      time: '18:00',
      type: 'food',
      title: getDiningTitle(dayNumber),
      description: getDiningDescription(dayNumber, sustainabilityLevel),
      location: 'Local dining area',
      duration: '1-2 hours',
      cost: getBudgetCost('dining', budget),
      carbonFootprint: calculateActivityCarbon('food', sustainabilityLevel),
      sustainabilityScore: sustainabilityLevel === 'high' ? 4 : sustainabilityLevel === 'medium' ? 3 : 2,
      ecoFeatures: getDiningEcoFeatures(sustainabilityLevel),
      coordinates
    }

    activities.push(eveningActivity)

  } catch (error) {
    console.error('Error generating day activities:', error)
    // // Fallback activities when POI fetch fails - create diverse daily schedule
    // const fallbackActivitiesByDay = {
    //   1: [
    //     {
    //       time: '09:00',
    //       type: 'cultural',
    //       title: 'Historic City Walking Tour',
    //       description: 'Explore the historic city center on foot, discovering architectural gems and learning about local heritage.',
    //       location: 'Historic city center',
    //       duration: '2-3 hours',
    //       cost: getBudgetCost('activity', budget),
    //       carbonFootprint: 0.1,
    //       sustainabilityScore: 5,
    //       ecoFeatures: ['Zero emissions', 'Local culture', 'Walking tour'],
    //       coordinates
    //     },
    //     {
    //       time: '14:00',
    //       type: 'local',
    //       title: 'Traditional Market Experience',
    //       description: 'Immerse yourself in local life at traditional markets, supporting local vendors and discovering authentic products.',
    //       location: 'Local market district',
    //       duration: '2 hours',
    //       cost: getBudgetCost('activity', budget),
    //       carbonFootprint: 0.2,
    //       sustainabilityScore: 4,
    //       ecoFeatures: ['Local community', 'Cultural exchange', 'Sustainable shopping'],
    //       coordinates
    //     }
    //   ],
    //   2: [
    //     {
    //       time: '09:00',
    //       type: 'cultural',
    //       title: 'Local Museum Visit',
    //       description: 'Discover the rich cultural heritage and history through fascinating exhibits and artifacts.',
    //       location: 'City museum district',
    //       duration: '2-3 hours',
    //       cost: getBudgetCost('activity', budget),
    //       carbonFootprint: 0.2,
    //       sustainabilityScore: 4,
    //       ecoFeatures: ['Educational', 'Cultural preservation', 'Indoor activity'],
    //       coordinates
    //     },
    //     {
    //       time: '13:00',
    //       type: 'nature',
    //       title: 'Urban Park Exploration',
    //       description: 'Enjoy green spaces and learn about urban sustainability initiatives and local flora.',
    //       location: 'City parks',
    //       duration: '2 hours',
    //       cost: getBudgetCost('activity', budget),
    //       carbonFootprint: 0.1,
    //       sustainabilityScore: 5,
    //       ecoFeatures: ['Nature connection', 'Fresh air', 'Eco-education'],
    //       coordinates
    //     },
    //     {
    //       time: '16:00',
    //       type: 'local',
    //       title: 'Artisan Workshop Visit',
    //       description: 'Visit local artisan workshops and learn about traditional crafts while supporting local craftspeople.',
    //       location: 'Artisan quarter',
    //       duration: '1-2 hours',
    //       cost: getBudgetCost('activity', budget),
    //       carbonFootprint: 0.1,
    //       sustainabilityScore: 4,
    //       ecoFeatures: ['Local artisans', 'Traditional crafts', 'Community support'],
    //       coordinates
    //     }
    //   ],
    //   3: [
    //     {
    //       time: '09:00',
    //       type: 'local',
    //       title: 'Neighborhood Discovery Walk',
    //       description: 'Explore authentic local neighborhoods, meet residents, and discover hidden gems off the tourist path.',
    //       location: 'Residential districts',
    //       duration: '2-3 hours',
    //       cost: getBudgetCost('activity', budget),
    //       carbonFootprint: 0.1,
    //       sustainabilityScore: 5,
    //       ecoFeatures: ['Community engagement', 'Authentic experience', 'Walking tour'],
    //       coordinates
    //     },
    //     {
    //       time: '13:00',
    //       type: 'cultural',
    //       title: 'Traditional Architecture Tour',
    //       description: 'Admire local architectural styles and learn about building techniques and cultural significance.',
    //       location: 'Historic architecture sites',
    //       duration: '2 hours',
    //       cost: getBudgetCost('activity', budget),
    //       carbonFootprint: 0.2,
    //       sustainabilityScore: 4,
    //       ecoFeatures: ['Heritage preservation', 'Educational', 'Cultural appreciation'],
    //       coordinates
    //     },
    //     {
    //       time: '16:00',
    //       type: 'shopping',
    //       title: 'Sustainable Shopping Experience',
    //       description: 'Support local businesses and discover eco-friendly products and traditional handicrafts.',
    //       location: 'Local shopping districts',
    //       duration: '1-2 hours',
    //       cost: getBudgetCost('activity', budget),
    //       carbonFootprint: 0.2,
    //       sustainabilityScore: 3,
    //       ecoFeatures: ['Local business support', 'Sustainable products', 'Economic impact'],
    //       coordinates
    //     }
    //   ]
    // }

    // // Get fallback activities for this specific day, or use day 1 as default
    // const dayFallbacks = fallbackActivitiesByDay[dayNumber] || fallbackActivitiesByDay[1]
    // activities.push(...dayFallbacks)
  }

  console.log(`Day ${dayNumber} final activities generated:`, activities.length)
  console.log(`Day ${dayNumber} activity titles:`, activities.map(a => a.title))

  return activities
}

async function getPointsOfInterest(coordinates, interests, sustainabilityLevel) {
  if (!OPENTRIPMAP_API_KEY) {
    console.warn('OpenTripMap API key not configured')
    return []
  }

  try {
    const radius = 15000 // 15km radius for more options
    const limit = 30 // Increase limit for more variety

    // Get categories based on interests
    const categories = interests.flatMap(interest =>
      INTEREST_CATEGORIES[interest] || ['cultural']
    )

    // Add some default categories for variety
    const allCategories = [...new Set([...categories, 'museums', 'historic', 'architecture', 'cultural'])]

    const allPOIs = []

    // Search for each category
    for (const category of allCategories.slice(0, 5)) { // Search up to 5 categories
      const params = new URLSearchParams({
        radius,
        limit: Math.ceil(limit / allCategories.length),
        lon: coordinates.lng,
        lat: coordinates.lat,
        kinds: category,
        format: 'json',
        apikey: OPENTRIPMAP_API_KEY
      })

      const response = await fetch(`${OPENTRIPMAP_BASE}/radius?${params}`)

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          // Fetch detailed information for each POI
          const poisWithDetails = await Promise.all(
            data
              .filter(poi => poi.name && poi.name.trim() !== '' && poi.rate >= 1)
              .slice(0, 8) // Limit to avoid too many API calls
              .map(async (poi) => {
                const detailedPoi = await fetchPOIDetails(poi.xid)
                return {
                  id: poi.xid,
                  name: poi.name || 'Interesting Place',
                  categories: [category],
                  coordinates: {
                    lat: poi.point.lat,
                    lng: poi.point.lon
                  },
                  location: poi.name || 'Local area',
                  rating: poi.rate || 1,
                  kinds: poi.kinds || category,
                  // Add detailed information
                  description: detailedPoi?.description || generatePoiDescription(poi.name, category, poi.kinds),
                  wikidata: detailedPoi?.wikidata || null,
                  wikipedia: detailedPoi?.wikipedia || null,
                  image: detailedPoi?.image || null,
                  address: detailedPoi?.address || null,
                  url: detailedPoi?.url || null,
                  kindsArray: poi.kinds ? poi.kinds.split(',').map(k => k.trim()) : [category]
                }
              })
          )

          allPOIs.push(...poisWithDetails)
        }
      } else {
        console.warn(`Failed to fetch POIs for category ${category}:`, response.status, response.statusText)
      }
    }

    // If we don't have enough POIs, try a broader search
    if (allPOIs.length < 8) {
      console.log('Not enough POIs found, trying broader search...')
      const broadParams = new URLSearchParams({
        radius: radius * 1.5,
        limit: 15,
        lon: coordinates.lng,
        lat: coordinates.lat,
        kinds: 'interesting_places',
        format: 'json',
        apikey: OPENTRIPMAP_API_KEY
      })

      const broadResponse = await fetch(`${OPENTRIPMAP_BASE}/radius?${broadParams}`)
      if (broadResponse.ok) {
        const broadData = await broadResponse.json()

        if (Array.isArray(broadData) && broadData.length > 0) {
          const broadPoisWithDetails = await Promise.all(
            broadData
              .filter(poi => poi.name && poi.name.trim() !== '')
              .slice(0, 5)
              .map(async (poi) => {
                const detailedPoi = await fetchPOIDetails(poi.xid)
                return {
                  id: poi.xid,
                  name: poi.name,
                  categories: ['cultural'],
                  coordinates: {
                    lat: poi.point.lat,
                    lng: poi.point.lon
                  },
                  location: poi.name,
                  rating: poi.rate || 1,
                  kinds: poi.kinds || 'interesting_places',
                  description: detailedPoi?.description || generatePoiDescription(poi.name, 'cultural', poi.kinds),
                  wikidata: detailedPoi?.wikidata || null,
                  wikipedia: detailedPoi?.wikipedia || null,
                  image: detailedPoi?.image || null,
                  address: detailedPoi?.address || null,
                  url: detailedPoi?.url || null,
                  kindsArray: poi.kinds ? poi.kinds.split(',').map(k => k.trim()) : ['cultural']
                }
              })
          )

          allPOIs.push(...broadPoisWithDetails)
        }
      }
    }

    // Remove duplicates based on name and sort by rating
    const uniquePOIs = allPOIs
      .filter((poi, index, self) =>
        index === self.findIndex(p => p.name === poi.name)
      )
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))

    console.log(`Total unique POIs with details found: ${uniquePOIs.length}`)
    return uniquePOIs.slice(0, 15) // Return top 15 unique POIs

  } catch (error) {
    console.error('Error fetching POIs:', error)
    return []
  }
}

// Fetch detailed POI information from OpenTripMap
async function fetchPOIDetails(xid) {
  if (!OPENTRIPMAP_API_KEY || !xid) return null

  try {
    const params = new URLSearchParams({
      apikey: OPENTRIPMAP_API_KEY,
      format: 'json'
    })

    const response = await fetch(`${OPENTRIPMAP_BASE}/xid/${xid}?${params}`)

    if (response.ok) {
      const data = await response.json()

      return {
        description: data.wikipedia_extracts?.text || data.info?.descr || null,
        wikidata: data.wikidata || null,
        wikipedia: data.wikipedia || null,
        image: data.preview?.source || data.image || null,
        address: data.address ? `${data.address.city || ''} ${data.address.state || ''} ${data.address.country || ''}`.trim() : null,
        url: data.url || null,
        sources: data.sources || null
      }
    }
  } catch (error) {
    console.error(`Error fetching POI details for ${xid}:`, error)
  }

  return null
}

// Helper function to generate better descriptions based on POI type
function generatePoiDescription(name, category, kinds) {
  if (kinds?.includes('museums')) {
    return `Explore the fascinating exhibits and cultural heritage at ${name}. A perfect blend of education and entertainment showcasing local history and artifacts.`
  } else if (kinds?.includes('historic')) {
    return `Step back in time and discover the rich history at ${name}. Experience the architectural beauty and historical significance of this landmark.`
  } else if (kinds?.includes('palaces')) {
    return `Marvel at the stunning architecture and royal heritage of ${name}. A magnificent example of historical grandeur and cultural importance.`
  } else if (kinds?.includes('architecture')) {
    return `Admire the architectural brilliance of ${name}. This structure represents the artistic and cultural heritage of the region.`
  } else if (kinds?.includes('natural')) {
    return `Connect with nature at ${name}. Enjoy the natural beauty and peaceful environment while learning about local ecology.`
  } else if (kinds?.includes('sport')) {
    return `Experience the local sports culture at ${name}. Learn about the community's passion for sports and recreational activities.`
  } else {
    return `Discover the unique charm of ${name}. This ${category} attraction offers insights into local culture and heritage.`
  }
}

// Helper functions
function calculateAccommodationSustainability(hotel) {
  let score = 3 // Base score

  if (hotel.features?.includes('Eco-Certified')) score += 2
  if (hotel.features?.includes('Solar Power')) score += 1
  if (hotel.features?.includes('Water Conservation')) score += 1

  return Math.min(score, 5)
}

function generateEcoFeatures(hotel) {
  const features = [
    'Energy efficient lighting',
    'Water conservation systems',
    'Recycling programs',
    'Local sourcing',
    'Green building materials'
  ]

  return features.sort(() => 0.5 - Math.random()).slice(0, 3)
}

function calculateAccommodationCarbon(hotel, duration) {
  // Estimate based on hotel type and duration
  const baseEmission = 15 // kg CO2 per night for eco-hotel
  const sustainabilityMultiplier = hotel.ecoRating ? (6 - parseFloat(hotel.ecoRating)) / 5 : 0.5

  return Math.round(baseEmission * sustainabilityMultiplier * duration * 100) / 100
}

function getTransportRecommendation(option, preference) {
  const recommendations = {
    public: 'Perfect for eco-conscious travelers! Low emissions and great coverage.',
    walking: 'Excellent for short distances and zero emissions!',
    cycling: 'Great exercise and completely carbon-free!',
    electric: 'Clean energy transport option with minimal emissions.'
  }

  return recommendations[preference] || 'Sustainable transport option available.'
}

function calculateTransportCarbonSavings(option) {
  // Compare to average car emissions (0.2 kg CO2/km)
  const carEmissions = 0.2
  const savings = Math.max(0, carEmissions - (option.carbonFactor || 0))

  return Math.round(savings * 10 * 100) / 100 // Assume 10km average trip
}

function getDayTheme(day, interests) {
  const themes = {
    1: 'Arrival & City Exploration',
    2: interests.includes('culture') ? 'Cultural Immersion' : 'Local Discovery',
    3: interests.includes('nature') ? 'Nature & Adventure' : 'Hidden Gems',
    4: interests.includes('food') ? 'Culinary Journey' : 'Local Experiences',
    5: 'Sustainable Living & Departure'
  }

  return themes[day] || `Day ${day} Adventures`
}

function getDateForDay(day) {
  const date = new Date()
  date.setDate(date.getDate() + 6 + day) // Start 7 days from now
  return date.toISOString().split('T')[0]
}

function getBudgetCost(type, budget) {
  const costs = {
    low: { attraction: 15, activity: 25, dining: 30 },
    medium: { attraction: 25, activity: 45, dining: 50 },
    high: { attraction: 40, activity: 75, dining: 80 }
  }

  return costs[budget]?.[type] || costs.medium[type] || 30
}

function calculateDaySustainability(activities) {
  const avgScore = activities.reduce((sum, activity) =>
    sum + (activity.sustainabilityScore || 3), 0
  ) / activities.length

  return Math.round(avgScore * 10) / 10
}

function calculateDayCost(activities, budget) {
  return activities.reduce((sum, activity) => sum + (activity.cost || 0), 0)
}

function calculateDayCarbon(activities) {
  // Use actual carbon footprint from activities or calculate estimate
  return activities.reduce((sum, activity) => {
    if (activity.carbonFootprint) {
      return sum + parseFloat(activity.carbonFootprint)
    }
    // Fallback calculation
    const baseCO2 = activity.type === 'nature' ? 0.2 : activity.type === 'cultural' ? 0.3 : 0.5
    const sustainabilityReduction = (activity.sustainabilityScore || 3) / 5
    return sum + (baseCO2 * (2 - sustainabilityReduction))
  }, 0)
}

async function calculateSustainabilityMetrics(itinerary) {
  const totalActivities = itinerary.days.reduce((sum, day) => sum + day.activities.length, 0)
  const ecoFriendlyActivities = itinerary.days.reduce((sum, day) =>
    sum + day.activities.filter(activity => activity.sustainabilityScore >= 4).length, 0
  )

  const avgEcoScore = itinerary.days.reduce((sum, day) =>
    sum + day.sustainabilityScore, 0
  ) / itinerary.days.length

  const totalCarbonSaved = itinerary.transport.reduce((sum, transport) =>
    sum + (transport.carbonSavings || 0), 0
  ) + (itinerary.accommodations.length * 50) // Assume 50kg saved per eco accommodation

  return {
    totalCarbonSaved: Math.round(totalCarbonSaved),
    ecoScore: Math.round(avgEcoScore * 10) / 10,
    sustainabilityFeatures: [
      'Eco-certified accommodations',
      'Low-carbon transport options',
      'Nature-based activities',
      'Local community engagement',
      'Sustainable dining choices'
    ],
    ecoFriendlyActivities,
    totalActivities,
    sustainabilityPercentage: Math.round((ecoFriendlyActivities / totalActivities) * 100)
  }
}

function getEcoFeaturesForActivity(activityType, categories) {
  const baseFeatures = {
    cultural: ['Local culture', 'Educational', 'Heritage preservation'],
    local: ['Local experience', 'Community engagement', 'Sustainable tourism'],
    food: ['Local sourcing', 'Traditional cooking', 'Organic ingredients'],
    shopping: ['Local artisans', 'Sustainable products', 'Community support'],
    nature: ['Environmental education', 'Low carbon', 'Nature conservation']
  }

  const categoryFeatures = {
    foods: ['Local cuisine', 'Traditional recipes'],
    shops: ['Local business', 'Artisan crafts'],
    cultural: ['Cultural heritage', 'Educational'],
    historic: ['Heritage preservation', 'Historical significance'],
    architecture: ['Architectural heritage', 'Design appreciation'],
    museums: ['Educational experience', 'Cultural preservation'],
    natural: ['Nature connection', 'Environmental awareness']
  }

  let features = baseFeatures[activityType] || ['Local experience', 'Sustainable tourism']

  // Add category-specific features
  if (categories) {
    // Handle both string and array formats
    const categoryList = Array.isArray(categories) ? categories :
      typeof categories === 'string' ? categories.split(',').map(c => c.trim()) : []

    categoryList.forEach(cat => {
      if (categoryFeatures[cat]) {
        features = [...features, ...categoryFeatures[cat]]
      }
    })
  }

  // Return unique features, max 3
  return [...new Set(features)].slice(0, 3)
}

// Enhanced description generation
async function generateEnhancedDescription(poi, activityType, sustainabilityLevel) {
  const sustainabilityFocus = sustainabilityLevel === 'high' ?
    ' with focus on sustainable practices and environmental conservation' :
    sustainabilityLevel === 'medium' ?
      ' featuring eco-friendly initiatives' : ''

  const kindsStr = poi.kinds || ''

  if (kindsStr.includes('museums')) {
    return `Explore the fascinating exhibits and cultural heritage at ${poi.name}. A perfect blend of education and entertainment showcasing local history and artifacts${sustainabilityFocus}.`
  } else if (kindsStr.includes('historic')) {
    return `Step back in time and discover the rich history at ${poi.name}. Experience the architectural beauty and historical significance of this landmark${sustainabilityFocus}.`
  } else if (kindsStr.includes('palaces')) {
    return `Marvel at the stunning architecture and royal heritage of ${poi.name}. A magnificent example of historical grandeur and cultural importance${sustainabilityFocus}.`
  } else if (kindsStr.includes('architecture')) {
    return `Admire the architectural brilliance of ${poi.name}. This structure represents the artistic and cultural heritage of the region${sustainabilityFocus}.`
  } else if (kindsStr.includes('natural')) {
    return `Connect with nature at ${poi.name}. Enjoy the natural beauty and peaceful environment while learning about local ecology and conservation efforts.`
  } else if (kindsStr.includes('sport')) {
    return `Experience active recreation at ${poi.name}. Engage in sustainable outdoor activities while enjoying the local sports culture${sustainabilityFocus}.`
  } else if (kindsStr.includes('foods')) {
    return `Discover authentic local cuisine at ${poi.name}. Experience traditional flavors and cooking methods${sustainabilityFocus}.`
  } else if (kindsStr.includes('bridges')) {
    return `Experience the architectural marvel of ${poi.name}. This historic bridge represents the engineering heritage and urban development of the area${sustainabilityFocus}.`
  } else if (kindsStr.includes('monuments')) {
    return `Discover the historical significance of ${poi.name}. This monument commemorates important events and cultural heritage${sustainabilityFocus}.`
  } else {
    return `Discover the unique charm of ${poi.name}. This ${activityType} attraction offers insights into local culture and heritage${sustainabilityFocus}.`
  }
}

// Calculate activity-specific carbon footprint
function calculateActivityCarbon(activityType, sustainabilityLevel, kinds = []) {
  const baseEmissions = {
    cultural: 0.3,
    nature: 0.1,
    food: 0.8,
    shopping: 0.5,
    local: 0.2
  }

  const sustainabilityMultiplier = {
    high: 0.6,    // 40% reduction for high sustainability
    medium: 0.8,  // 20% reduction for medium
    low: 1.0      // No reduction for low
  }

  let baseCarbon = baseEmissions[activityType] || 0.3

  // Handle both string and array formats for kinds
  const kindsList = Array.isArray(kinds) ? kinds :
    typeof kinds === 'string' ? kinds.split(',').map(k => k.trim()) : []

  // Adjust based on specific POI types
  if (kindsList.includes('natural')) baseCarbon *= 0.5  // Nature activities are lower carbon
  if (kindsList.includes('museums')) baseCarbon *= 0.7  // Indoor activities slightly lower
  if (kindsList.includes('foods')) baseCarbon *= 1.2   // Food activities slightly higher
  if (kindsList.includes('architecture')) baseCarbon *= 0.8  // Architectural visits are moderate

  return Math.round(baseCarbon * sustainabilityMultiplier[sustainabilityLevel] * 100) / 100
}

// Calculate activity sustainability score
function calculateActivitySustainability(activityType, kinds = [], sustainabilityLevel) {
  let baseScore = 3

  // Activity type scoring
  if (activityType === 'nature') baseScore = 5
  else if (activityType === 'cultural') baseScore = 4
  else if (activityType === 'local') baseScore = 4
  else if (activityType === 'food') baseScore = 3
  else if (activityType === 'shopping') baseScore = 2

  // Handle both string and array formats for kinds
  const kindsList = Array.isArray(kinds) ? kinds :
    typeof kinds === 'string' ? kinds.split(',').map(k => k.trim()) : []

  // Adjust based on POI characteristics
  if (kindsList.includes('natural')) baseScore = Math.min(baseScore + 1, 5)
  if (kindsList.includes('historic')) baseScore = Math.min(baseScore + 0.5, 5)
  if (kindsList.includes('museums')) baseScore = Math.min(baseScore + 0.5, 5)
  if (kindsList.includes('architecture')) baseScore = Math.min(baseScore + 0.3, 5)

  // Adjust based on sustainability level
  if (sustainabilityLevel === 'high') baseScore = Math.min(baseScore + 0.5, 5)
  else if (sustainabilityLevel === 'low') baseScore = Math.max(baseScore - 0.5, 1)

  return Math.round(baseScore * 10) / 10
}

// Get duration based on activity type
function getDurationByActivityType(activityType, index) {
  const durations = {
    cultural: ['2-3 hours', '2 hours', '1.5 hours', '1 hour'],
    nature: ['3-4 hours', '2-3 hours', '2 hours', '1.5 hours'],
    food: ['1-2 hours', '1 hour', '45 minutes', '30 minutes'],
    shopping: ['1-2 hours', '1 hour', '45 minutes', '30 minutes'],
    local: ['2 hours', '1.5 hours', '1 hour', '45 minutes']
  }

  return durations[activityType]?.[index] || '1-2 hours'
}

// Get dining titles for different days
function getDiningTitle(dayNumber) {
  const titles = {
    1: 'Welcome Dinner at Local Restaurant',
    2: 'Traditional Lunch Experience',
    3: 'Farm-to-Table Dining',
    4: 'Farewell Sustainable Feast'
  }

  return titles[dayNumber] || 'Local Sustainable Dining'
}

// Get dining descriptions
function getDiningDescription(dayNumber, sustainabilityLevel) {
  const ecoFocus = sustainabilityLevel === 'high' ?
    'featuring organic ingredients, zero-waste practices, and local sourcing' :
    sustainabilityLevel === 'medium' ?
      'with focus on local ingredients and sustainable practices' :
      'supporting local restaurants and traditional cooking'

  const descriptions = {
    1: `Start your journey with authentic local cuisine ${ecoFocus}. Experience traditional flavors while supporting sustainable dining.`,
    2: `Enjoy a traditional lunch prepared using time-honored methods ${ecoFocus}. Discover the rich culinary heritage of the region.`,
    3: `Experience farm-to-table dining ${ecoFocus}. Connect with local farmers and enjoy the freshest seasonal ingredients.`,
    4: `Conclude your eco-friendly adventure with a memorable meal ${ecoFocus}. Celebrate sustainable travel and local culture.`
  }

  return descriptions[dayNumber] || `Experience local cuisine at eco-friendly restaurants ${ecoFocus}.`
}

// Get dining eco features
function getDiningEcoFeatures(sustainabilityLevel) {
  const features = {
    high: ['Organic ingredients', 'Local sourcing', 'Zero waste', 'Seasonal menu'],
    medium: ['Local sourcing', 'Seasonal ingredients', 'Minimal packaging'],
    low: ['Local restaurant', 'Traditional cooking', 'Community support']
  }

  return features[sustainabilityLevel] || features.medium
}

function generateItinerarySummary(itinerary) {
  const totalCost = itinerary.days.reduce((sum, day) => sum + (day.estimatedCost || 0), 0)
  const totalCarbonFootprint = itinerary.days.reduce((sum, day) => sum + (day.carbonFootprint || 0), 0)
  const highlights = []

  // Generate highlights based on activities
  itinerary.days.forEach(day => {
    const culturalActivities = day.activities.filter(a => a.type === 'cultural')
    const natureActivities = day.activities.filter(a => a.type === 'nature')

    if (culturalActivities.length > 0) {
      highlights.push(`Cultural exploration: ${culturalActivities[0].title}`)
    }
    if (natureActivities.length > 0) {
      highlights.push(`Nature experience: ${natureActivities[0].title}`)
    }
  })

  return {
    totalCost: Math.round(totalCost),
    totalCarbonFootprint: Math.round(totalCarbonFootprint * 100) / 100,
    highlights: highlights.slice(0, 5),
    ecoFriendlyActivities: itinerary.sustainability.ecoFriendlyActivities,
    sustainabilityRating: itinerary.sustainability.ecoScore,
    sustainabilityPercentage: itinerary.sustainability.sustainabilityPercentage,
    carbonSaved: itinerary.sustainability.totalCarbonSaved
  }
}