import { NextResponse } from 'next/server'

const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY
const OPENTRIPMAP_BASE = 'https://api.opentripmap.com/0.1/en/places'

export async function GET(request, { params }) {
  const { xid } = params

  if (!OPENTRIPMAP_API_KEY) {
    return NextResponse.json(
      { error: 'OpenTripMap API key not configured' },
      { status: 500 }
    )
  }

  if (!xid) {
    return NextResponse.json(
      { error: 'Activity XID is required' },
      { status: 400 }
    )
  }

  try {
    const apiParams = new URLSearchParams({
      apikey: OPENTRIPMAP_API_KEY,
      format: 'json'
    })

    const response = await fetch(`${OPENTRIPMAP_BASE}/xid/${xid}?${apiParams}`)

    if (!response.ok) {
      throw new Error(`OpenTripMap API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data to match our expected format
    const activityDetails = {
      xid: data.xid,
      name: data.name,
      description: data.wikipedia_extracts?.text || data.info?.descr || 'No description available',
      address: data.address ? {
        full: `${data.address.road || ''} ${data.address.house || ''}, ${data.address.city || ''}, ${data.address.country || ''}`.trim(),
        city: data.address.city,
        country: data.address.country,
        postcode: data.address.postcode,
        road: data.address.road,
        house: data.address.house
      } : null,
      coordinates: data.point ? {
        lat: data.point.lat,
        lng: data.point.lon
      } : null,
      rating: data.rate ? parseFloat(data.rate) : null,
      kinds: data.kinds ? data.kinds.split(',').map(k => k.trim()) : [],
      image: data.preview?.source || data.image || null,
      wikipedia: data.wikipedia || null,
      wikidata: data.wikidata || null,
      url: data.url || null,
      bbox: data.bbox || null,
      sources: data.sources || null,
      otm: data.otm || null
    }

    return NextResponse.json({
      success: true,
      data: activityDetails
    })

  } catch (error) {
    console.error('Error fetching activity details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity details' },
      { status: 500 }
    )
  }
}