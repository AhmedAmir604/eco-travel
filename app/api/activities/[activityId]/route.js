import { NextResponse } from 'next/server';
import { hasAmadeusCredentials, makeAmadeusRequest } from '@/lib/amadeus';

export async function GET(request, { params }) {
  try {
    const { activityId } = params;

    if (!activityId) {
      return NextResponse.json({
        success: false,
        error: 'Activity ID is required'
      }, { status: 400 });
    }

    // Check if this is a fallback activity ID
    if (activityId.startsWith('fallback-')) {
      return getFallbackActivityDetail(activityId);
    }

    // Check if Amadeus credentials are available
    if (!hasAmadeusCredentials()) {
      console.warn('Amadeus API credentials not configured, using fallback data');
      return getFallbackActivityDetail(activityId);
    }

    // Get activity details using centralized utility
    const response = await makeAmadeusRequest(
      `/v1/shopping/activities/${activityId}`
    );


    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: 'Activity not found'
        }, { status: 404 });
      }
      console.warn('Amadeus activity detail API failed, using fallback data');
      return getFallbackActivityDetail(activityId);
    }

    const data = await response.json();
    const activity = data.data;


    // Transform the activity data
    const activityDetail = {
      id: activity.id,
      name: activity.name,
      description: activity.shortDescription,
      longDescription: activity.description || activity.shortDescription,
      price: activity.price ? {
        amount: parseFloat(activity.price.amount),
        currency: activity.price.currencyCode
      } : null,
      rating: activity.rating ? parseFloat(activity.rating) : null,
      images: activity.pictures || ['/placeholder.svg'],
      bookingLink: activity.bookingLink,
      coordinates: {
        latitude: parseFloat(activity.geoCode.latitude),
        longitude: parseFloat(activity.geoCode.longitude)
      },
      duration: activity.duration || 'Varies',
      category: activity.category || 'Cultural',
      minimumAge: activity.minimumAge || null,
      wheelchair: activity.wheelchair || false,
      isRealData: true,
      highlights: activity.highlights || [],
      included: activity.included || [],
      notIncluded: activity.notIncluded || [],
      requirements: activity.requirements || [],
      cancellation: activity.cancellation || 'Standard cancellation policy applies'
    };

    return NextResponse.json({
      success: true,
      data: activityDetail
    });

  } catch (error) {
    console.error('Activity detail API error:', error);

    // Fallback to dummy data
    return getFallbackActivityDetail(params.activityId);
  }
}

function getFallbackActivityDetail(activityId) {
  const fallbackActivities = {
    'fallback-1': {
      id: 'fallback-1',
      name: 'Eco-Friendly City Walking Tour',
      description: 'Discover sustainable practices and green spaces in the city center.',
      longDescription: 'Join our comprehensive eco-friendly city walking tour that takes you through the most sustainable and environmentally conscious areas of the city. Learn about local environmental initiatives, visit green spaces, meet eco-friendly businesses, and discover how cities can become more sustainable. This tour includes visits to urban gardens, green buildings, renewable energy installations, and eco-friendly shops. Our knowledgeable guides will share insights about environmental challenges and solutions, making this both an educational and inspiring experience.',
      price: { amount: 25, currency: 'USD' },
      rating: 4.5,
      images: ['/placeholder.svg'],
      bookingLink: '#',
      coordinates: { latitude: 0, longitude: 0 },
      duration: '3 hours',
      category: 'Eco-Tour',
      minimumAge: 8,
      wheelchair: true,
      isRealData: false,
      highlights: [
        'Visit 5+ sustainable businesses and green spaces',
        'Learn about urban environmental initiatives',
        'Meet local eco-entrepreneurs',
        'Discover renewable energy installations',
        'Explore urban farming projects'
      ],
      included: [
        'Professional eco-guide',
        'Educational materials',
        'Small group size (max 12 people)',
        'Complimentary eco-friendly snack',
        'Digital photo album'
      ],
      notIncluded: [
        'Transportation to meeting point',
        'Personal expenses',
        'Lunch',
        'Gratuities'
      ],
      requirements: [
        'Comfortable walking shoes required',
        'Weather-appropriate clothing',
        'Basic fitness level for 3-hour walk'
      ],
      cancellation: 'Free cancellation up to 24 hours before the tour'
    },
    'fallback-2': {
      id: 'fallback-2',
      name: 'Sustainable Food Market Experience',
      description: 'Explore local organic markets and taste sustainable, locally-sourced food.',
      longDescription: 'Immerse yourself in the local food culture while supporting sustainable agriculture. This guided tour takes you through the best organic and farmers markets in the city, where you\'ll meet local producers, learn about sustainable farming practices, and taste fresh, seasonal produce. The experience includes tastings of artisanal products, conversations with farmers about their eco-friendly methods, and insights into how food choices impact the environment. You\'ll leave with a deeper understanding of sustainable food systems and practical tips for eco-conscious eating.',
      price: { amount: 45, currency: 'USD' },
      rating: 4.7,
      images: ['/placeholder.svg'],
      bookingLink: '#',
      coordinates: { latitude: 0, longitude: 0 },
      duration: '4 hours',
      category: 'Food & Culture',
      minimumAge: 12,
      wheelchair: true,
      isRealData: false,
      highlights: [
        'Visit 3-4 local organic markets',
        'Meet local farmers and producers',
        'Taste 8+ sustainable food products',
        'Learn about seasonal eating',
        'Discover zero-waste food practices'
      ],
      included: [
        'Expert food guide',
        'All food tastings',
        'Market vendor meetings',
        'Recipe cards for sustainable cooking',
        'Reusable shopping bag'
      ],
      notIncluded: [
        'Additional food purchases',
        'Beverages during tour',
        'Transportation between markets',
        'Personal shopping'
      ],
      requirements: [
        'Please inform of any food allergies',
        'Comfortable walking shoes',
        'Bring water bottle'
      ],
      cancellation: 'Free cancellation up to 48 hours before the experience'
    }
  };

  const activity = fallbackActivities[activityId] || fallbackActivities['fallback-1'];

  return NextResponse.json({
    success: true,
    data: activity,
    fallback: true,
    message: 'Using eco-friendly activity details. Configure Amadeus API for real-time data.'
  });
}