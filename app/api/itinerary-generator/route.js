import { generatePersonalizedItinerary } from '@/lib/itinerary-generator'

export async function POST(request) {
  try {
    const preferences = await request.json()

    // Validate required fields
    const { destination, duration, travelers } = preferences

    if (!destination || !duration || !travelers) {
      return Response.json(
        { error: 'Destination, duration, and travelers are required' },
        { status: 400 }
      )
    }

    // Generate personalized itinerary
    const itinerary = await generatePersonalizedItinerary(preferences)

    // Generate unique ID for the itinerary
    const itineraryId = `itinerary-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

    // Prepare the itinerary with ID
    const finalItinerary = {
      ...itinerary,
      id: itineraryId,
      title: itinerary.title || `Eco-Friendly ${itinerary.destination} Adventure`,
      createdAt: new Date().toISOString(),
      preferences
    }
    // //("helo", finalItinerary);
    return Response.json({
      success: true,
      data: finalItinerary,
      preferences
    })
  } catch (error) {
    console.error('Itinerary generation error:', error)
    return Response.json(
      { error: 'Failed to generate itinerary', details: error.message },
      { status: 500 }
    )
  }
}

// This function is now handled by the shared storage module

export async function GET() {
  return Response.json({
    message: 'Eco-Friendly Itinerary Generator API',
    usage: {
      POST: 'Generate itinerary with preferences object',
      requiredFields: ['destination', 'duration', 'travelers'],
      optionalFields: ['interests', 'budget', 'accommodationType', 'transportPreference', 'sustainabilityLevel']
    },
    example: {
      destination: 'Paris, France',
      duration: 5,
      travelers: 2,
      interests: ['culture', 'nature', 'food'],
      budget: 'medium',
      accommodationType: 'eco-hotel',
      transportPreference: 'public',
      sustainabilityLevel: 'high'
    }
  })
}