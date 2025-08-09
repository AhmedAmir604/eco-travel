import { 
  discoverAreaTransport, 
  getTransportDetails, 
  getAreaTransportSummary, 
  geocodeAddress 
} from '@/lib/google-maps-transport'

export async function POST(request) {
  try {
    const { location, type, transportType, radius } = await request.json()

    if (!location) {
      return Response.json(
        { error: 'Location is required' },
        { status: 400 }
      )
    }

    let results = []

    switch (type) {
      case 'discover':
        // Discover all available transport methods in the area
        results = await discoverAreaTransport(location, radius)
        break
        
      case 'details':
        // Get detailed info about a specific transport type
        if (!transportType) {
          return Response.json(
            { error: 'Transport type is required for details' },
            { status: 400 }
          )
        }
        results = await getTransportDetails(location, transportType, radius)
        break
        
      case 'summary':
        // Get area transport summary with statistics
        results = await getAreaTransportSummary(location, radius)
        break
        
      default:
        // Default: discover transport options
        results = await discoverAreaTransport(location, radius)
    }
    
    // console.log("results:", results);

    return Response.json({
      success: true,
      data: results,
      location,
      type: type || 'discover',
      radius: radius || 5000
    })
  } catch (error) {
    console.error('Transport finder error:', error)
    return Response.json(
      { error: 'Failed to find transport options', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return Response.json({
      message: 'Area Transport Finder API',
      usage: {
        POST: 'Discover transport in area with { location, type?, transportType?, radius? }',
        GET: 'Geocode address with ?address=location',
        types: ['discover', 'details', 'summary']
      }
    })
  }

  try {
    const geocoded = await geocodeAddress(address)
    return Response.json({
      success: true,
      data: geocoded
    })
  } catch (error) {
    return Response.json(
      { error: 'Failed to geocode address', details: error.message },
      { status: 400 }
    )
  }
}