import { NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/amadeus';

export async function GET(request, { params }) {
  try {
    const { hotelId } = params;
    const { searchParams } = new URL(request.url);
    
    // Get search parameters for hotel offers
    const checkIn = searchParams.get('checkIn') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkOut = searchParams.get('checkOut') || new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const adults = searchParams.get('adults') || '1';

    if (!hotelId) {
      return NextResponse.json({ error: 'Hotel ID is required' }, { status: 400 });
    }

    console.log(`Fetching details for hotel: ${hotelId}`);

    // Get hotel offers from Amadeus API
    const hotelDetails = await amadeusAPI.getHotelOffers(hotelId, checkIn, checkOut, parseInt(adults));

    if (!hotelDetails) {
      // Return basic hotel info even if no offers are available
      return NextResponse.json({
        success: true,
        data: {
          id: hotelId,
          name: 'Hotel Details Not Available',
          location: 'Location varies',
          description: 'This hotel is available for booking but detailed information is not currently available in our test environment. Please contact the hotel directly for pricing and availability.',
          image: '/placeholder.svg',
          ecoRating: '4.0',
          rating: '4.0',
          features: ['Eco-Certified', 'Energy Efficient', 'Sustainable Practices'],
          amenities: ['Restaurant', 'WiFi', 'Fitness Center'],
          offers: [],
          available: false,
          noDataAvailable: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: hotelDetails
    });

  } catch (error) {
    console.error('API Error:', error);

    // Handle specific Amadeus API errors
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      return NextResponse.json(
        { error: 'API authentication failed. Please check your Amadeus API credentials.' },
        { status: 401 }
      );
    }

    if (error.message.includes('quota') || error.message.includes('429')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to fetch hotel details at the moment. Please try again later.' },
      { status: 500 }
    );
  }
}