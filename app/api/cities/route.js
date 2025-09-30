import { NextResponse } from "next/server";
import { makeAmadeusRequest, hasAmadeusCredentials } from "@/lib/amadeus";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const countryCode = searchParams.get("countryCode"); // Optional country filter

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Query must be at least 2 characters long",
      });
    }

    // Check if Amadeus credentials are available
    if (!hasAmadeusCredentials()) {
      console.warn("Amadeus credentials not found, using fallback cities");
      return getFallbackCities(query, "no_key");
    }

    // Extract just the city name if a full display name was passed (e.g., "Lahore, Pakistan" -> "Lahore")
    const cityName = query.includes(",")
      ? query.split(",")[0].trim()
      : query.trim();

    // Build Amadeus API parameters
    const params = new URLSearchParams({
      keyword: cityName,
      max: "10",
    });

    // Add country filter if provided
    if (countryCode) {
      params.append("countryCode", countryCode);
    }

    // Make request to Amadeus Cities API
    const response = await makeAmadeusRequest(
      `/v1/reference-data/locations/cities?${params}`
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("Amadeus API unauthorized, using fallback cities");
        return getFallbackCities(query, "no_key");
      }
      if (response.status === 429) {
        console.warn("Amadeus API rate limit exceeded, using fallback cities");
        return getFallbackCities(query, "rate_limited");
      }
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Transform Amadeus response to match our expected format
    const cities =
      data.data?.map((city) => {
        const countryName = getCountryName(city.address?.countryCode);
        const displayName = `${city.name}, ${countryName}`;

        return {
          id: city.iataCode || `${city.name}-${city.address?.countryCode}`,
          name: city.name,
          region: null, // Don't show region codes
          country: countryName,
          countryCode: city.address?.countryCode,
          displayName: displayName,
          iataCode: city.iataCode,
          latitude: city.geoCode?.latitude,
          longitude: city.geoCode?.longitude,
        };
      }) || [];

    return NextResponse.json({
      success: true,
      data: cities,
      total: data.meta?.count || cities.length,
    });
  } catch (error) {
    console.error("City search API error:", error);

    // Extract query from request for fallback
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    // Fallback to static cities if API fails
    return getFallbackCities(query, "api_error");
  }
}

// Helper function to get country name from country code
function getCountryName(countryCode) {
  const countryNames = {
    US: "United States",
    GB: "United Kingdom",
    FR: "France",
    DE: "Germany",
    IT: "Italy",
    ES: "Spain",
    JP: "Japan",
    AU: "Australia",
    CA: "Canada",
    IN: "India",
    PK: "Pakistan",
    PT: "Portugal",
    NL: "Netherlands",
    CH: "Switzerland",
    AT: "Austria",
    BE: "Belgium",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    FI: "Finland",
    IE: "Ireland",
    SG: "Singapore",
    AE: "United Arab Emirates",
    TH: "Thailand",
    MY: "Malaysia",
    ID: "Indonesia",
    PH: "Philippines",
    VN: "Vietnam",
    KR: "South Korea",
    CN: "China",
    HK: "Hong Kong",
    TW: "Taiwan",
    BR: "Brazil",
    MX: "Mexico",
    AR: "Argentina",
    CL: "Chile",
    CO: "Colombia",
    PE: "Peru",
    ZA: "South Africa",
    EG: "Egypt",
    MA: "Morocco",
    KE: "Kenya",
    NG: "Nigeria",
    RU: "Russia",
    TR: "Turkey",
    GR: "Greece",
    CZ: "Czech Republic",
    PL: "Poland",
    HU: "Hungary",
    RO: "Romania",
    BG: "Bulgaria",
    HR: "Croatia",
    SI: "Slovenia",
    SK: "Slovakia",
    LT: "Lithuania",
    LV: "Latvia",
    EE: "Estonia",
  };

  return countryNames[countryCode] || countryCode || "Unknown";
}

// Fallback function with popular cities for when API is not available
function getFallbackCities(query, reason = "api_unavailable") {
  const popularCities = [
    {
      id: "LON",
      name: "London",
      region: "England",
      country: "United Kingdom",
      countryCode: "GB",
      iataCode: "LON",
      latitude: 51.5074,
      longitude: -0.1278,
    },
    {
      id: "LAX",
      name: "Los Angeles",
      region: "California",
      country: "United States",
      countryCode: "US",
      iataCode: "LAX",
      latitude: 34.0522,
      longitude: -118.2437,
    },
    {
      id: "LHE",
      name: "Lahore",
      region: "Punjab",
      country: "Pakistan",
      countryCode: "PK",
      iataCode: "LHE",
      latitude: 31.558,
      longitude: 74.35071,
    },
    {
      id: "LAS",
      name: "Las Vegas",
      region: "Nevada",
      country: "United States",
      countryCode: "US",
      iataCode: "LAS",
      latitude: 36.1699,
      longitude: -115.1398,
    },
    {
      id: "LIS",
      name: "Lisbon",
      region: "Lisbon",
      country: "Portugal",
      countryCode: "PT",
      iataCode: "LIS",
      latitude: 38.7223,
      longitude: -9.1393,
    },
    {
      id: "LPL",
      name: "Liverpool",
      region: "England",
      country: "United Kingdom",
      countryCode: "GB",
      iataCode: "LPL",
      latitude: 53.4084,
      longitude: -2.9916,
    },
    {
      id: "LYS",
      name: "Lyon",
      region: "Auvergne-Rhône-Alpes",
      country: "France",
      countryCode: "FR",
      iataCode: "LYS",
      latitude: 45.764,
      longitude: 4.8357,
    },
    {
      id: "PAR",
      name: "Paris",
      region: "Île-de-France",
      country: "France",
      countryCode: "FR",
      iataCode: "PAR",
      latitude: 48.8566,
      longitude: 2.3522,
    },
    {
      id: "NYC",
      name: "New York",
      region: "New York",
      country: "United States",
      countryCode: "US",
      iataCode: "NYC",
      latitude: 40.7128,
      longitude: -74.006,
    },
    {
      id: "TYO",
      name: "Tokyo",
      region: "Tokyo",
      country: "Japan",
      countryCode: "JP",
      iataCode: "TYO",
      latitude: 35.6762,
      longitude: 139.6503,
    },
    {
      id: "MAD",
      name: "Madrid",
      region: "Madrid",
      country: "Spain",
      countryCode: "ES",
      iataCode: "MAD",
      latitude: 40.4168,
      longitude: -3.7038,
    },
    {
      id: "MEL",
      name: "Melbourne",
      region: "Victoria",
      country: "Australia",
      countryCode: "AU",
      iataCode: "MEL",
      latitude: -37.8136,
      longitude: 144.9631,
    },
    {
      id: "BOM",
      name: "Mumbai",
      region: "Maharashtra",
      country: "India",
      countryCode: "IN",
      iataCode: "BOM",
      latitude: 19.076,
      longitude: 72.8777,
    },
    {
      id: "MUC",
      name: "Munich",
      region: "Bavaria",
      country: "Germany",
      countryCode: "DE",
      iataCode: "MUC",
      latitude: 48.1351,
      longitude: 11.582,
    },
    {
      id: "MIL",
      name: "Milan",
      region: "Lombardy",
      country: "Italy",
      countryCode: "IT",
      iataCode: "MIL",
      latitude: 45.4642,
      longitude: 9.19,
    },
  ];

  const filteredCities = popularCities
    .filter(
      (city) =>
        city.name.toLowerCase().startsWith(query.toLowerCase()) ||
        city.name.toLowerCase().includes(query.toLowerCase())
    )
    .map((city) => ({
      ...city,
      displayName: `${city.name}, ${city.country}`,
    }))
    .slice(0, 10);

  const messages = {
    api_unavailable:
      "Using fallback city data. Configure Amadeus API credentials for full functionality.",
    rate_limited:
      "API rate limit exceeded. Using fallback data. Consider upgrading your API plan.",
    no_key:
      "No Amadeus API credentials configured. Using static city data. Add AMADEUS_API_KEY and AMADEUS_API_SECRET to environment variables.",
    api_error:
      "An error occurred while fetching city data. Using fallback city data.",
  };

  return NextResponse.json({
    success: true,
    data: filteredCities,
    total: filteredCities.length,
    fallback: true,
    reason: reason,
    message: messages[reason] || messages.api_unavailable,
  });
}
