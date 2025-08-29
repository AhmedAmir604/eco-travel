import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'Query must be at least 2 characters long'
      });
    }

    // GeoDB Cities API configuration
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
      }
    };

    // Check if API key is available
    if (!process.env.RAPIDAPI_KEY) {
      console.warn('RAPIDAPI_KEY not found, using fallback cities');
      return getFallbackCities(query, 'no_key');
    }

    // API endpoint for city search with namePrefix
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query)}&limit=10&offset=0&types=CITY&minPopulation=10000`;

    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('GeoDB API key not configured, using fallback cities');
        return getFallbackCities(query, 'no_key');
      }
      if (response.status === 429) {
        console.warn('GeoDB API rate limit exceeded, using fallback cities');
        return getFallbackCities(query, 'rate_limited');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform the response to match our expected format
    const cities = data.data?.map(city => ({
      id: city.id,
      name: city.name,
      region: city.region,
      country: city.country,
      countryCode: city.countryCode,
      displayName: `${city.name}, ${city.region ? city.region + ', ' : ''}${city.country}`,
      population: city.population,
      latitude: city.latitude,
      longitude: city.longitude
    })) || [];

    return NextResponse.json({
      success: true,
      data: cities,
      total: data.metadata?.totalCount || cities.length
    });

  } catch (error) {
    console.error('City search API error:', error);

    // Extract query from request for fallback
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Fallback to static cities if API fails
    return getFallbackCities(query);
  }
}

// Fallback function with popular cities for when API is not available
function getFallbackCities(query, reason = 'api_unavailable') {
  const popularCities = [
    { id: 1, name: 'London', region: 'England', country: 'United Kingdom', countryCode: 'GB', population: 8982000 },
    { id: 2, name: 'Los Angeles', region: 'California', country: 'United States', countryCode: 'US', population: 3980400 },
    { id: 3, name: 'Lahore', region: 'Punjab', country: 'Pakistan', countryCode: 'PK', population: 11126285 },
    { id: 4, name: 'Las Vegas', region: 'Nevada', country: 'United States', countryCode: 'US', population: 648685 },
    { id: 5, name: 'Lisbon', region: 'Lisbon', country: 'Portugal', countryCode: 'PT', population: 517802 },
    { id: 6, name: 'Liverpool', region: 'England', country: 'United Kingdom', countryCode: 'GB', population: 498042 },
    { id: 7, name: 'Lyon', region: 'Auvergne-Rhône-Alpes', country: 'France', countryCode: 'FR', population: 515695 },
    { id: 8, name: 'Paris', region: 'Île-de-France', country: 'France', countryCode: 'FR', population: 2161000 },
    { id: 9, name: 'New York', region: 'New York', country: 'United States', countryCode: 'US', population: 8175133 },
    { id: 10, name: 'Tokyo', region: 'Tokyo', country: 'Japan', countryCode: 'JP', population: 9273000 },
    { id: 11, name: 'Madrid', region: 'Madrid', country: 'Spain', countryCode: 'ES', population: 3223334 },
    { id: 12, name: 'Melbourne', region: 'Victoria', country: 'Australia', countryCode: 'AU', population: 4963349 },
    { id: 13, name: 'Mumbai', region: 'Maharashtra', country: 'India', countryCode: 'IN', population: 12442373 },
    { id: 14, name: 'Munich', region: 'Bavaria', country: 'Germany', countryCode: 'DE', population: 1471508 },
    { id: 15, name: 'Milan', region: 'Lombardy', country: 'Italy', countryCode: 'IT', population: 1378689 }
  ];

  const filteredCities = popularCities
    .filter(city => 
      city.name.toLowerCase().startsWith(query.toLowerCase()) ||
      city.name.toLowerCase().includes(query.toLowerCase())
    )
    .map(city => ({
      ...city,
      displayName: `${city.name}, ${city.region ? city.region + ', ' : ''}${city.country}`,
      latitude: null,
      longitude: null
    }))
    .slice(0, 10);

  const messages = {
    api_unavailable: 'Using fallback city data. Configure RAPIDAPI_KEY for full functionality.',
    rate_limited: 'API rate limit exceeded. Using fallback data. Consider upgrading your API plan.',
    no_key: 'No API key configured. Using static city data. Add RAPIDAPI_KEY to environment variables.'
  };

  return NextResponse.json({
    success: true,
    data: filteredCities,
    total: filteredCities.length,
    fallback: true,
    reason: reason,
    message: messages[reason] || messages.api_unavailable
  });
}