import { amadeusAPI } from "./amadeus";
import { discoverAreaTransport, geocodeAddress } from "./google-maps-transport";

// OpenTripMap API configuration
const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY;
const OPENTRIPMAP_BASE = "https://api.opentripmap.com/0.1/en/places";

// Climatiq API configuration
const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY;
const CLIMATIQ_BASE = "https://beta3.api.climatiq.io";

// Interest categories mapping to OpenTripMap categories
const INTEREST_CATEGORIES = {
  culture: ["museums", "historic", "architecture", "cultural"],
  nature: ["natural", "geological", "sport"],
  food: ["foods", "shops"],
  adventure: ["sport", "amusements"],
  history: ["historic", "museums", "architecture"],
  art: ["museums", "cultural", "architecture"],
  nightlife: ["amusements", "foods"],
  shopping: ["shops"],
  wellness: ["sport", "natural"],
};

// Sustainability scoring factors
const SUSTAINABILITY_FACTORS = {
  transport: {
    walking: 5,
    cycling: 5,
    public_transit: 4,
    electric_vehicle: 3,
    hybrid: 2,
    conventional: 1,
  },
  accommodation: {
    "eco-certified": 5,
    "green-hotel": 4,
    boutique: 3,
    standard: 2,
    luxury: 1,
  },
  activities: {
    "nature-based": 5,
    cultural: 4,
    "local-community": 4,
    educational: 4,
    adventure: 3,
    shopping: 2,
    nightlife: 1,
  },
};

export async function generatePersonalizedItinerary(preferences) {
  const {
    destination,
    duration,
    travelers,
    interests = ["culture"],
    budget = "medium",
    accommodationType = "eco-hotel",
    transportPreference = "public",
    sustainabilityLevel = "high",
  } = preferences;

  try {
    // Step 1: Geocode destination and get coordinates
    const locationData = await geocodeAddress(destination);
    const coordinates = locationData.location;

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
        sustainabilityLevel,
      },
      days: [],
      accommodations: [],
      transport: [],
      sustainability: {
        totalCarbonSaved: 0,
        ecoScore: 0,
        sustainabilityFeatures: [],
      },
      summary: {
        totalCost: 0,
        highlights: [],
        ecoFriendlyActivities: 0,
      },
    };

    // Step 3: Find eco-friendly accommodations
    itinerary.accommodations = await findEcoAccommodations(
      destination,
      duration,
      travelers
    );

    // Step 4: Discover sustainable transport options
    console.log("🚌 Discovering sustainable transport...");
    itinerary.transport = await findSustainableTransport(
      coordinates,
      transportPreference
    );

    // Step 5: Generate daily activities based on interests
    console.log("🎯 Generating personalized activities from Amadeus...");
    itinerary.days = await generateDailyActivities(
      coordinates,
      duration,
      interests,
      sustainabilityLevel,
      budget
    );

    console.log("✅ Generated activities:", itinerary.days);

    // Step 6: Calculate sustainability metrics
    console.log("📊 Calculating sustainability metrics...");
    itinerary.sustainability = await calculateSustainabilityMetrics(itinerary);

    console.log("itinerary sustainibility:", itinerary.sustainability);
    // Step 7: Generate summary and recommendations
    itinerary.summary = generateItinerarySummary(itinerary);

    console.log(
      `✅ Generated ${duration}-day eco-friendly itinerary with ${itinerary.days.length} days of activities`
    );

    return itinerary;
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw new Error(`Failed to generate itinerary: ${error.message}`);
  }
}

async function findEcoAccommodations(destination, duration, travelers) {
  try {
    // Use Amadeus API to find hotels
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7); // 7 days from now
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + duration);

    const hotels = await amadeusAPI.searchHotels(
      destination,
      checkIn.toISOString().split("T")[0],
      checkOut.toISOString().split("T")[0],
      travelers
    );

    // Filter and enhance with eco-features
    return hotels.slice(0, 3).map((hotel) => ({
      ...hotel,
      sustainabilityScore: calculateAccommodationSustainability(hotel),
      ecoFeatures: generateEcoFeatures(hotel),
      carbonFootprint: calculateAccommodationCarbon(hotel, duration),
    }));
  } catch (error) {
    console.error("Error finding accommodations:", error);
    return [];
  }
}

async function findSustainableTransport(coordinates, preference) {
  try {
    const location = `${coordinates.lat},${coordinates.lng}`;
    const transportOptions = await discoverAreaTransport(location, 5000);

    // Filter based on preference and sustainability
    const sustainableOptions = transportOptions
      .filter((option) => option.ecoScore >= 3)
      .sort((a, b) => b.ecoScore - a.ecoScore)
      .slice(0, 5);

    return sustainableOptions.map((option) => ({
      ...option,
      recommendation: getTransportRecommendation(option, preference),
      carbonSavings: calculateTransportCarbonSavings(option),
    }));
  } catch (error) {
    console.error("Error finding transport:", error);
    return [];
  }
}

async function generateDailyActivities(
  coordinates,
  duration,
  interests,
  sustainabilityLevel,
  budget
) {
  const days = [];

  // Fetch all POIs once and distribute them across days
  // console.log('🎯 Fetching all POIs for the trip...')
  const allPois = await getPointsOfInterest(
    coordinates,
    interests,
    sustainabilityLevel,
    duration
  );
  // console.log(`Total POIs found for entire trip: ${allPois.length}`)

  // Prioritize activities with images, then shuffle within those groups
  const poisWithImages = allPois.filter(
    (poi) => poi.image && poi.pictures && poi.pictures.length > 0
  );
  const poisWithoutImages = allPois.filter(
    (poi) => !poi.image || !poi.pictures || poi.pictures.length === 0
  );

  // Shuffle each group separately
  const shuffledWithImages = [...poisWithImages].sort(
    () => 0.5 - Math.random()
  );
  const shuffledWithoutImages = [...poisWithoutImages].sort(
    () => 0.5 - Math.random()
  );

  // Combine: prioritize images first
  const shuffledPois = [...shuffledWithImages, ...shuffledWithoutImages];

  const minPoisPerDay = 8; // Increased from 4 to 8
  const poisPerDay = Math.max(
    minPoisPerDay,
    Math.ceil(shuffledPois.length / duration)
  );

  for (let day = 1; day <= duration; day++) {
    // Get unique POIs for this day
    const startIndex = (day - 1) * poisPerDay;
    const endIndex = startIndex + poisPerDay;
    const dayPois = shuffledPois.slice(startIndex, endIndex);

    const dayActivities = await generateDayActivities(
      coordinates,
      interests,
      sustainabilityLevel,
      budget,
      day,
      dayPois // Pass the specific POIs for this day
    );

    days.push({
      day,
      date: getDateForDay(day),
      theme: getDayTheme(day, interests),
      activities: dayActivities,
      sustainabilityScore: calculateDaySustainability(dayActivities),
      estimatedCost: calculateDayCost(dayActivities, budget),
      carbonFootprint: calculateDayCarbon(dayActivities),
    });
  }

  return days;
}

async function generateDayActivities(
  coordinates,
  interests,
  sustainabilityLevel,
  budget,
  dayNumber,
  dayPois = []
) {
  const activities = [];

  try {
    // Use the pre-assigned POIs for this day
    const pois = dayPois;

    console.log(`Day ${dayNumber} POIs assigned:`, pois.length);
    if (pois.length > 0) {
      console.log(
        `POIs for day ${dayNumber}:`,
        pois.map((p) => ({ name: p.name, rating: p.rating, kinds: p.kinds }))
      );
    } else {
      console.log(
        `No POIs assigned for day ${dayNumber}, will use fallback activities`
      );
    }

    if (pois.length > 0) {
      // Sort POIs: prioritize those with images, then by rating
      const sortedPois = pois.sort((a, b) => {
        // First priority: has images
        const aHasImages = a.image && a.pictures && a.pictures.length > 0;
        const bHasImages = b.image && b.pictures && b.pictures.length > 0;

        if (aHasImages && !bHasImages) return -1;
        if (!aHasImages && bHasImages) return 1;

        // Second priority: rating
        return (b.rating || 0) - (a.rating || 0);
      });

      // Create diverse activities based on available POIs
      const timeSlots = [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
      ];

      // Create at least 8 activities per day using available POIs (save evening for dining)
      const numActivities = Math.min(8, sortedPois.length); // At least 8 or as many as available

      for (let i = 0; i < numActivities; i++) {
        const time = timeSlots[i] || "10:00";

        // Use POI if available, otherwise create fallback activity
        if (i < sortedPois.length) {
          const poi = sortedPois[i];

          // Determine activity type based on POI categories
          let activityType = "cultural";
          const kindsStr = poi.kinds || "";
          if (kindsStr.includes("museums")) activityType = "cultural";
          else if (kindsStr.includes("historic")) activityType = "cultural";
          else if (kindsStr.includes("natural")) activityType = "nature";
          else if (kindsStr.includes("foods")) activityType = "food";
          else if (kindsStr.includes("shops")) activityType = "shopping";
          else if (kindsStr.includes("sport")) activityType = "nature";
          else if (kindsStr.includes("architecture")) activityType = "cultural";

          // Use real description from API or generate enhanced one
          let description =
            poi.description ||
            (await generateEnhancedDescription(
              poi,
              activityType,
              sustainabilityLevel
            ));

          // Calculate more realistic carbon footprint based on activity type and sustainability level
          const carbonFootprint = calculateActivityCarbon(
            activityType,
            sustainabilityLevel,
            poi.kinds
          );

          // Calculate sustainability score based on activity type and features
          const sustainabilityScore = calculateActivitySustainability(
            activityType,
            poi.kinds,
            sustainabilityLevel
          );

          activities.push({
            time: time,
            type: activityType,
            title: poi.name,
            description: description,
            location: poi.address || poi.location || `${poi.name} area`,
            duration: getDurationByActivityType(activityType, i),
            cost: poi.price
              ? poi.price.amount
              : getBudgetCost(
                  activityType === "food" ? "dining" : "activity",
                  budget
                ),
            carbonFootprint: carbonFootprint,
            sustainabilityScore: sustainabilityScore,
            ecoFeatures: getEcoFeaturesForActivity(
              activityType,
              poi.kindsArray || poi.kinds
            ),
            coordinates: poi.coordinates,
            rating: poi.rating || 4.0,
            // Amadeus API specific fields
            image: poi.image,
            pictures: poi.pictures || [],
            price: poi.price || null,
            currency: poi.price?.currency || "USD",
            bookingLink: poi.bookingLink || null,
            amadeusId: poi.amadeusId || null,
            selfLink: poi.selfLink || null,
            // Legacy fields for compatibility
            wikidata: poi.wikidata,
            wikipedia: poi.wikipedia,
            kindsArray:
              poi.kindsArray ||
              (poi.kinds ? poi.kinds.split(",").map((k) => k.trim()) : []),
            url: poi.bookingLink || poi.url || null,
          });
        } else {
          // Create fallback activity when no POI is available
          const fallbackActivities = [
            {
              type: "cultural",
              title: "Local Heritage Walk",
              description:
                "Explore the local heritage and architectural highlights of the area on foot.",
              location: "City center",
            },
            {
              type: "nature",
              title: "Sustainable Transportation Tour",
              description:
                "Discover eco-friendly transportation options and green spaces in the city.",
              location: "Green corridors",
            },
            {
              type: "cultural",
              title: "Local Market Visit",
              description:
                "Experience local culture and sustainable shopping at traditional markets.",
              location: "Local markets",
            },
            {
              type: "nature",
              title: "Eco-Friendly Activity",
              description:
                "Participate in environmentally conscious activities and learn about local sustainability efforts.",
              location: "Community spaces",
            },
          ];

          const fallbackIndex =
            (i - sortedPois.length) % fallbackActivities.length;
          const fallback = fallbackActivities[fallbackIndex];

          activities.push({
            time: time,
            type: fallback.type,
            title: fallback.title,
            description: fallback.description,
            location: fallback.location,
            duration: getDurationByActivityType(fallback.type, i),
            cost: getBudgetCost("activity", budget),
            carbonFootprint: calculateActivityCarbon(
              fallback.type,
              sustainabilityLevel
            ),
            sustainabilityScore:
              sustainabilityLevel === "high"
                ? 4
                : sustainabilityLevel === "medium"
                ? 3
                : 2,
            ecoFeatures: getEcoFeaturesForActivity(fallback.type, ""),
            coordinates,
            rating: 4.0,
          });
        }
      }
    }

    // Evening activity (food/local experience) - use Amadeus API for dining
    try {
      const token = await amadeusAPI.getLiveToken();

      // Search for food/dining activities from Amadeus
      let radius = 1;
      let foodActivities = [];

      // Try to find food-related activities
      while (foodActivities.length === 0 && radius <= 10) {
        const params = new URLSearchParams({
          latitude: coordinates.lat.toString(),
          longitude: coordinates.lng.toString(),
          radius: radius.toString(),
        });

        const response = await fetch(
          `https://test.api.amadeus.com/v1/shopping/activities?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.data && Array.isArray(data.data)) {
            // Filter for food/dining related activities
            foodActivities = data.data.filter((activity) => {
              const text = `${activity.name} ${
                activity.description || ""
              }`.toLowerCase();
              return (
                text.includes("food") ||
                text.includes("dining") ||
                text.includes("restaurant") ||
                text.includes("culinary") ||
                text.includes("cuisine") ||
                text.includes("meal") ||
                text.includes("tasting") ||
                text.includes("wine") ||
                text.includes("cooking") ||
                text.includes("dinner") ||
                text.includes("lunch")
              );
            });
          }
        }

        radius += 3; // Expand search radius
      }

      let eveningActivity;
      if (foodActivities.length > 0) {
        // Use real Amadeus food activity
        const foodActivity = foodActivities[0];
        eveningActivity = {
          time: "18:00",
          type: "food",
          title: foodActivity.name,
          description:
            foodActivity.description ||
            `Enjoy a delightful dining experience at ${foodActivity.name}`,
          location: foodActivity.geoCode
            ? `${foodActivity.geoCode.latitude}, ${foodActivity.geoCode.longitude}`
            : "Local dining area",
          duration: "1-2 hours",
          cost: foodActivity.price
            ? parseFloat(foodActivity.price.amount)
            : getBudgetCost("dining", budget),
          carbonFootprint: calculateActivityCarbon("food", sustainabilityLevel),
          sustainabilityScore:
            sustainabilityLevel === "high"
              ? 4
              : sustainabilityLevel === "medium"
              ? 3
              : 2,
          ecoFeatures: getDiningEcoFeatures(sustainabilityLevel),
          coordinates: foodActivity.geoCode
            ? {
                lat: parseFloat(foodActivity.geoCode.latitude),
                lng: parseFloat(foodActivity.geoCode.longitude),
              }
            : coordinates,
          rating: foodActivity.rating ? parseFloat(foodActivity.rating) : 4.0,
          // Amadeus API specific fields
          image:
            foodActivity.pictures && foodActivity.pictures.length > 0
              ? foodActivity.pictures[0]
              : null,
          pictures: foodActivity.pictures || [],
          price: foodActivity.price
            ? {
                amount: parseFloat(foodActivity.price.amount),
                currency: foodActivity.price.currencyCode,
              }
            : null,
          bookingLink: foodActivity.bookingLink || null,
          amadeusId: foodActivity.id,
          selfLink: foodActivity.self?.href || null,
          kindsArray: ["food", "dining"],
        };
      } else {
        // Use a generic Amadeus activity as fallback
        const genericActivities = dayPois.filter(
          (poi) => !activities.find((a) => a.amadeusId === poi.amadeusId)
        );

        if (genericActivities.length > 0) {
          const fallbackActivity = genericActivities[0];
          eveningActivity = {
            time: "18:00",
            type: "food",
            title: `Evening at ${fallbackActivity.name}`,
            description:
              fallbackActivity.description ||
              `Experience ${fallbackActivity.name}`,
            location: fallbackActivity.location || "Local area",
            duration: "1-2 hours",
            cost: fallbackActivity.price
              ? fallbackActivity.price.amount
              : getBudgetCost("dining", budget),
            carbonFootprint: calculateActivityCarbon(
              "food",
              sustainabilityLevel
            ),
            sustainabilityScore:
              sustainabilityLevel === "high"
                ? 4
                : sustainabilityLevel === "medium"
                ? 3
                : 2,
            ecoFeatures: getDiningEcoFeatures(sustainabilityLevel),
            coordinates: fallbackActivity.coordinates || coordinates,
            rating: fallbackActivity.rating || 4.0,
            // Amadeus API specific fields
            image: fallbackActivity.image,
            pictures: fallbackActivity.pictures || [],
            price: fallbackActivity.price || null,
            bookingLink: fallbackActivity.bookingLink || null,
            amadeusId: fallbackActivity.amadeusId,
            selfLink: fallbackActivity.selfLink || null,
            kindsArray: ["evening", "experience"],
          };
        } else {
          // Last resort - generic evening activity
          eveningActivity = {
            time: "18:00",
            type: "local",
            title: "Evening Local Experience",
            description:
              "Explore the local evening scene and discover authentic experiences in the area.",
            location: "Local area",
            duration: "1-2 hours",
            cost: getBudgetCost("dining", budget),
            carbonFootprint: calculateActivityCarbon(
              "food",
              sustainabilityLevel
            ),
            sustainabilityScore:
              sustainabilityLevel === "high"
                ? 4
                : sustainabilityLevel === "medium"
                ? 3
                : 2,
            ecoFeatures: getDiningEcoFeatures(sustainabilityLevel),
            coordinates,
            rating: 4.0,
            kindsArray: ["evening", "local"],
          };
        }
      }

      activities.push(eveningActivity);
    } catch (eveningError) {
      console.error("Error fetching evening activities:", eveningError);

      // Fallback to generic activity
      activities.push({
        time: "18:00",
        type: "local",
        title: "Evening Local Experience",
        description:
          "Explore the local evening scene and discover authentic experiences.",
        location: "Local area",
        duration: "1-2 hours",
        cost: getBudgetCost("dining", budget),
        carbonFootprint: calculateActivityCarbon("local", sustainabilityLevel),
        sustainabilityScore:
          sustainabilityLevel === "high"
            ? 4
            : sustainabilityLevel === "medium"
            ? 3
            : 2,
        ecoFeatures: [
          "Local experience",
          "Cultural immersion",
          "Community engagement",
        ],
        coordinates,
        rating: 4.0,
        kindsArray: ["evening", "local"],
      });
    }
  } catch (error) {
    console.error("Error generating day activities:", error);
  }

  return activities;
}

async function getPointsOfInterest(
  coordinates,
  interests,
  sustainabilityLevel,
  duration
) {
  try {
    console.log("🎯 Fetching activities from Amadeus API...");

    // Use Amadeus Activities API
    const token = await amadeusAPI.getLiveToken();

    // Start with 1km radius and expand if needed
    let radius = 1;
    let allActivities = [];
    const maxRadius = 20;

    // Try increasing radius until we get enough activities (increased to 10 per day minimum)
    while (allActivities.length < duration * 10 && radius <= maxRadius) {
      const params = new URLSearchParams({
        latitude: coordinates.lat.toString(),
        longitude: coordinates.lng.toString(),
        radius: radius.toString(),
      });

      console.log(`Searching activities at radius ${radius}km...`);

      const response = await fetch(
        `https://test.api.amadeus.com/v1/shopping/activities?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          console.log(
            `✅ Found ${data.data.length} activities at ${radius}km radius`
          );

          // Convert Amadeus activities to our POI format
          const activities = data.data.map((activity) => ({
            id: activity.id,
            name: activity.name,
            description: activity.description || `Discover ${activity.name}`,
            coordinates: {
              lat: parseFloat(activity.geoCode?.latitude || coordinates.lat),
              lng: parseFloat(activity.geoCode?.longitude || coordinates.lng),
            },
            location: activity.geoCode
              ? `${activity.geoCode.latitude}, ${activity.geoCode.longitude}`
              : "Location",
            rating: activity.rating ? parseFloat(activity.rating) : 4.0,
            image:
              activity.pictures && activity.pictures.length > 0
                ? activity.pictures[0]
                : null,
            pictures: activity.pictures || [],
            price: activity.price
              ? {
                  amount: parseFloat(activity.price.amount),
                  currency: activity.price.currencyCode,
                }
              : null,
            bookingLink: activity.bookingLink || null,
            // Determine activity type from description
            type: determineActivityType(activity.name, activity.description),
            categories: [
              determineActivityType(activity.name, activity.description),
            ],
            kinds: determineActivityType(activity.name, activity.description),
            kindsArray: [
              determineActivityType(activity.name, activity.description),
            ],
            // Amadeus-specific fields
            amadeusId: activity.id,
            selfLink: activity.self?.href || null,
            address: `Near ${coordinates.lat}, ${coordinates.lng}`,
          }));

          allActivities.push(...activities);
        }
      } else {
        console.warn(
          `Failed to fetch activities at radius ${radius}km:`,
          response.status
        );
      }

      // Increase radius for next iteration
      radius += 5;

      // If we already have enough activities, stop searching
      if (allActivities.length >= duration * 10) {
        break;
      }
    }

    // Remove duplicates
    const uniqueActivities = allActivities.filter(
      (activity, index, self) =>
        index === self.findIndex((a) => a.id === activity.id)
    );

    // Sort by: 1) Has images (priority), 2) Rating
    const sortedActivities = uniqueActivities.sort((a, b) => {
      // Check if activities have images
      const aHasImages = a.image && a.pictures && a.pictures.length > 0;
      const bHasImages = b.image && b.pictures && b.pictures.length > 0;

      // Prioritize activities with images
      if (aHasImages && !bHasImages) return -1;
      if (!aHasImages && bHasImages) return 1;

      // Then sort by rating
      return (b.rating || 0) - (a.rating || 0);
    });

    console.log(`📊 Total unique activities found: ${sortedActivities.length}`);
    console.log(
      `📸 Activities with images: ${
        sortedActivities.filter((a) => a.image).length
      }`
    );
    return sortedActivities.slice(0, duration * 10); // Return up to 10 activities per day
  } catch (error) {
    console.error("Error fetching activities from Amadeus:", error);
    return [];
  }
}

// Helper function to determine activity type from name/description
function determineActivityType(name, description) {
  const text = `${name} ${description || ""}`.toLowerCase();

  if (
    text.includes("museum") ||
    text.includes("art") ||
    text.includes("gallery") ||
    text.includes("cultural") ||
    text.includes("historic")
  ) {
    return "cultural";
  } else if (
    text.includes("nature") ||
    text.includes("park") ||
    text.includes("garden") ||
    text.includes("outdoor")
  ) {
    return "nature";
  } else if (
    text.includes("food") ||
    text.includes("restaurant") ||
    text.includes("dining") ||
    text.includes("culinary")
  ) {
    return "food";
  } else if (
    text.includes("shop") ||
    text.includes("market") ||
    text.includes("shopping")
  ) {
    return "shopping";
  } else if (
    text.includes("adventure") ||
    text.includes("sport") ||
    text.includes("activity")
  ) {
    return "adventure";
  } else {
    return "cultural"; // Default
  }
}

// Helper functions
function calculateAccommodationSustainability(hotel) {
  let score = 3; // Base score

  if (hotel.features?.includes("Eco-Certified")) score += 2;
  if (hotel.features?.includes("Solar Power")) score += 1;
  if (hotel.features?.includes("Water Conservation")) score += 1;

  return Math.min(score, 5);
}

function generateEcoFeatures(hotel) {
  const features = [
    "Energy efficient lighting",
    "Water conservation systems",
    "Recycling programs",
    "Local sourcing",
    "Green building materials",
  ];

  return features.sort(() => 0.5 - Math.random()).slice(0, 3);
}

function calculateAccommodationCarbon(hotel, duration) {
  // Estimate based on hotel type and duration
  const baseEmission = 15; // kg CO2 per night for eco-hotel
  const sustainabilityMultiplier = hotel.ecoRating
    ? (6 - parseFloat(hotel.ecoRating)) / 5
    : 0.5;

  return (
    Math.round(baseEmission * sustainabilityMultiplier * duration * 100) / 100
  );
}

function getTransportRecommendation(option, preference) {
  const recommendations = {
    public:
      "Perfect for eco-conscious travelers! Low emissions and great coverage.",
    walking: "Excellent for short distances and zero emissions!",
    cycling: "Great exercise and completely carbon-free!",
    electric: "Clean energy transport option with minimal emissions.",
  };

  return (
    recommendations[preference] || "Sustainable transport option available."
  );
}

function calculateTransportCarbonSavings(option) {
  // Compare to average car emissions (0.2 kg CO2/km)
  const carEmissions = 0.2;
  const savings = Math.max(0, carEmissions - (option.carbonFactor || 0));

  return Math.round(savings * 10 * 100) / 100; // Assume 10km average trip
}

function getDayTheme(day, interests) {
  const themes = {
    1: "Arrival & City Exploration",
    2: interests.includes("culture") ? "Cultural Immersion" : "Local Discovery",
    3: interests.includes("nature") ? "Nature & Adventure" : "Hidden Gems",
    4: interests.includes("food") ? "Culinary Journey" : "Local Experiences",
    5: "Sustainable Living & Departure",
  };

  return themes[day] || `Day ${day} Adventures`;
}

function getDateForDay(day) {
  const date = new Date();
  date.setDate(date.getDate() + 6 + day); // Start 7 days from now
  return date.toISOString().split("T")[0];
}

function getBudgetCost(type, budget) {
  const costs = {
    low: { attraction: 15, activity: 25, dining: 30 },
    medium: { attraction: 25, activity: 45, dining: 50 },
    high: { attraction: 40, activity: 75, dining: 80 },
  };

  return costs[budget]?.[type] || costs.medium[type] || 30;
}

function calculateDaySustainability(activities) {
  const avgScore =
    activities.reduce(
      (sum, activity) => sum + (activity.sustainabilityScore || 3),
      0
    ) / activities.length;

  return Math.round(avgScore * 10) / 10;
}

function calculateDayCost(activities, budget) {
  return activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
}

function calculateDayCarbon(activities) {
  // Use actual carbon footprint from activities or calculate estimate
  return activities.reduce((sum, activity) => {
    if (activity.carbonFootprint) {
      return sum + parseFloat(activity.carbonFootprint);
    }
    // Fallback calculation
    const baseCO2 =
      activity.type === "nature"
        ? 0.2
        : activity.type === "cultural"
        ? 0.3
        : 0.5;
    const sustainabilityReduction = (activity.sustainabilityScore || 3) / 5;
    return sum + baseCO2 * (2 - sustainabilityReduction);
  }, 0);
}

async function calculateSustainabilityMetrics(itinerary) {
  const totalActivities = itinerary.days.reduce(
    (sum, day) => sum + day.activities.length,
    0
  );
  const ecoFriendlyActivities = itinerary.days.reduce(
    (sum, day) =>
      sum +
      day.activities.filter((activity) => activity.sustainabilityScore >= 4)
        .length,
    0
  );

  const avgEcoScore =
    itinerary.days.reduce((sum, day) => sum + day.sustainabilityScore, 0) /
    itinerary.days.length;

  const totalCarbonSaved =
    itinerary.transport.reduce(
      (sum, transport) => sum + (transport.carbonSavings || 0),
      0
    ) +
    itinerary.accommodations.length * 50; // Assume 50kg saved per eco accommodation

  return {
    totalCarbonSaved: Math.round(totalCarbonSaved),
    ecoScore: Math.round(avgEcoScore * 10) / 10,
    sustainabilityFeatures: [
      "Eco-certified accommodations",
      "Low-carbon transport options",
      "Nature-based activities",
      "Local community engagement",
      "Sustainable dining choices",
    ],
    ecoFriendlyActivities,
    totalActivities,
    sustainabilityPercentage: Math.round(
      (ecoFriendlyActivities / totalActivities) * 100
    ),
  };
}

function getEcoFeaturesForActivity(activityType, categories) {
  const baseFeatures = {
    cultural: ["Local culture", "Educational", "Heritage preservation"],
    local: ["Local experience", "Community engagement", "Sustainable tourism"],
    food: ["Local sourcing", "Traditional cooking", "Organic ingredients"],
    shopping: ["Local artisans", "Sustainable products", "Community support"],
    nature: ["Environmental education", "Low carbon", "Nature conservation"],
  };

  const categoryFeatures = {
    foods: ["Local cuisine", "Traditional recipes"],
    shops: ["Local business", "Artisan crafts"],
    cultural: ["Cultural heritage", "Educational"],
    historic: ["Heritage preservation", "Historical significance"],
    architecture: ["Architectural heritage", "Design appreciation"],
    museums: ["Educational experience", "Cultural preservation"],
    natural: ["Nature connection", "Environmental awareness"],
  };

  let features = baseFeatures[activityType] || [
    "Local experience",
    "Sustainable tourism",
  ];

  // Add category-specific features
  if (categories) {
    // Handle both string and array formats
    const categoryList = Array.isArray(categories)
      ? categories
      : typeof categories === "string"
      ? categories.split(",").map((c) => c.trim())
      : [];

    categoryList.forEach((cat) => {
      if (categoryFeatures[cat]) {
        features = [...features, ...categoryFeatures[cat]];
      }
    });
  }

  // Return unique features, max 3
  return [...new Set(features)].slice(0, 3);
}

// Enhanced description generation
async function generateEnhancedDescription(
  poi,
  activityType,
  sustainabilityLevel
) {
  const sustainabilityFocus =
    sustainabilityLevel === "high"
      ? " with focus on sustainable practices and environmental conservation"
      : sustainabilityLevel === "medium"
      ? " featuring eco-friendly initiatives"
      : "";

  const kindsStr = poi.kinds || "";

  if (kindsStr.includes("museums")) {
    return `Explore the fascinating exhibits and cultural heritage at ${poi.name}. A perfect blend of education and entertainment showcasing local history and artifacts${sustainabilityFocus}.`;
  } else if (kindsStr.includes("historic")) {
    return `Step back in time and discover the rich history at ${poi.name}. Experience the architectural beauty and historical significance of this landmark${sustainabilityFocus}.`;
  } else if (kindsStr.includes("palaces")) {
    return `Marvel at the stunning architecture and royal heritage of ${poi.name}. A magnificent example of historical grandeur and cultural importance${sustainabilityFocus}.`;
  } else if (kindsStr.includes("architecture")) {
    return `Admire the architectural brilliance of ${poi.name}. This structure represents the artistic and cultural heritage of the region${sustainabilityFocus}.`;
  } else if (kindsStr.includes("natural")) {
    return `Connect with nature at ${poi.name}. Enjoy the natural beauty and peaceful environment while learning about local ecology and conservation efforts.`;
  } else if (kindsStr.includes("sport")) {
    return `Experience active recreation at ${poi.name}. Engage in sustainable outdoor activities while enjoying the local sports culture${sustainabilityFocus}.`;
  } else if (kindsStr.includes("foods")) {
    return `Discover authentic local cuisine at ${poi.name}. Experience traditional flavors and cooking methods${sustainabilityFocus}.`;
  } else if (kindsStr.includes("bridges")) {
    return `Experience the architectural marvel of ${poi.name}. This historic bridge represents the engineering heritage and urban development of the area${sustainabilityFocus}.`;
  } else if (kindsStr.includes("monuments")) {
    return `Discover the historical significance of ${poi.name}. This monument commemorates important events and cultural heritage${sustainabilityFocus}.`;
  } else {
    return `Discover the unique charm of ${poi.name}. This ${activityType} attraction offers insights into local culture and heritage${sustainabilityFocus}.`;
  }
}

// Calculate activity-specific carbon footprint
function calculateActivityCarbon(
  activityType,
  sustainabilityLevel,
  kinds = []
) {
  const baseEmissions = {
    cultural: 0.3,
    nature: 0.1,
    food: 0.8,
    shopping: 0.5,
    local: 0.2,
  };

  const sustainabilityMultiplier = {
    high: 0.6, // 40% reduction for high sustainability
    medium: 0.8, // 20% reduction for medium
    low: 1.0, // No reduction for low
  };

  let baseCarbon = baseEmissions[activityType] || 0.3;

  // Handle both string and array formats for kinds
  const kindsList = Array.isArray(kinds)
    ? kinds
    : typeof kinds === "string"
    ? kinds.split(",").map((k) => k.trim())
    : [];

  // Adjust based on specific POI types
  if (kindsList.includes("natural")) baseCarbon *= 0.5; // Nature activities are lower carbon
  if (kindsList.includes("museums")) baseCarbon *= 0.7; // Indoor activities slightly lower
  if (kindsList.includes("foods")) baseCarbon *= 1.2; // Food activities slightly higher
  if (kindsList.includes("architecture")) baseCarbon *= 0.8; // Architectural visits are moderate

  return (
    Math.round(
      baseCarbon * sustainabilityMultiplier[sustainabilityLevel] * 100
    ) / 100
  );
}

// Calculate activity sustainability score
function calculateActivitySustainability(
  activityType,
  kinds = [],
  sustainabilityLevel
) {
  let baseScore = 3;

  // Activity type scoring
  if (activityType === "nature") baseScore = 5;
  else if (activityType === "cultural") baseScore = 4;
  else if (activityType === "local") baseScore = 4;
  else if (activityType === "food") baseScore = 3;
  else if (activityType === "shopping") baseScore = 2;

  // Handle both string and array formats for kinds
  const kindsList = Array.isArray(kinds)
    ? kinds
    : typeof kinds === "string"
    ? kinds.split(",").map((k) => k.trim())
    : [];

  // Adjust based on POI characteristics
  if (kindsList.includes("natural")) baseScore = Math.min(baseScore + 1, 5);
  if (kindsList.includes("historic")) baseScore = Math.min(baseScore + 0.5, 5);
  if (kindsList.includes("museums")) baseScore = Math.min(baseScore + 0.5, 5);
  if (kindsList.includes("architecture"))
    baseScore = Math.min(baseScore + 0.3, 5);

  // Adjust based on sustainability level
  if (sustainabilityLevel === "high") baseScore = Math.min(baseScore + 0.5, 5);
  else if (sustainabilityLevel === "low")
    baseScore = Math.max(baseScore - 0.5, 1);

  return Math.round(baseScore * 10) / 10;
}

// Get duration based on activity type
function getDurationByActivityType(activityType, index) {
  const durations = {
    cultural: ["2-3 hours", "2 hours", "1.5 hours", "1 hour"],
    nature: ["3-4 hours", "2-3 hours", "2 hours", "1.5 hours"],
    food: ["1-2 hours", "1 hour", "45 minutes", "30 minutes"],
    shopping: ["1-2 hours", "1 hour", "45 minutes", "30 minutes"],
    local: ["2 hours", "1.5 hours", "1 hour", "45 minutes"],
  };

  return durations[activityType]?.[index] || "1-2 hours";
}

// Get dining eco features
function getDiningEcoFeatures(sustainabilityLevel) {
  const features = {
    high: [
      "Organic ingredients",
      "Local sourcing",
      "Zero waste",
      "Seasonal menu",
    ],
    medium: ["Local sourcing", "Seasonal ingredients", "Minimal packaging"],
    low: ["Local restaurant", "Traditional cooking", "Community support"],
  };

  return features[sustainabilityLevel] || features.medium;
}

function generateItinerarySummary(itinerary) {
  const totalCost = itinerary.days.reduce(
    (sum, day) => sum + (day.estimatedCost || 0),
    0
  );
  const totalCarbonFootprint = itinerary.days.reduce(
    (sum, day) => sum + (day.carbonFootprint || 0),
    0
  );
  const highlights = [];

  // Generate highlights based on activities
  itinerary.days.forEach((day) => {
    const culturalActivities = day.activities.filter(
      (a) => a.type === "cultural"
    );
    const natureActivities = day.activities.filter((a) => a.type === "nature");

    if (culturalActivities.length > 0) {
      highlights.push(`Cultural exploration: ${culturalActivities[0].title}`);
    }
    if (natureActivities.length > 0) {
      highlights.push(`Nature experience: ${natureActivities[0].title}`);
    }
  });

  return {
    totalCost: Math.round(totalCost),
    totalCarbonFootprint: Math.round(totalCarbonFootprint * 100) / 100,
    highlights: highlights.slice(0, 5),
    ecoFriendlyActivities: itinerary.sustainability.ecoFriendlyActivities,
    sustainabilityRating: itinerary.sustainability.ecoScore,
    sustainabilityPercentage: itinerary.sustainability.sustainabilityPercentage,
    carbonSaved: itinerary.sustainability.totalCarbonSaved,
  };
}
