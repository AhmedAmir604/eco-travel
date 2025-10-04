// Transport images service with real image URLs and fallbacks

// Real transport images from Unsplash (free to use)
export const TRANSPORT_IMAGES = {
  walking: {
    large:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=400&fit=crop&crop=center",
    small:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=200&fit=crop&crop=center",
    alt: "People walking on a pedestrian path",
  },
  cycling_routes: {
    large:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&crop=center",
    small:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center",
    alt: "Cycling path with bike lanes",
  },
  bicycle_store: {
    large:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=400&fit=crop&crop=center",
    small:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300&h=200&fit=crop&crop=center",
    alt: "Bike sharing station with rental bikes",
  },
  transit_station: {
    large:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop&crop=center",
    small:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop&crop=center",
    alt: "Modern public transit station",
  },
  train_station: {
    large:
      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&h=400&fit=crop&crop=center",
    small:
      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=300&h=200&fit=crop&crop=center",
    alt: "High-speed train at modern station",
  },
  subway_station: {
    large:
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=400&fit=crop&crop=center",
    small:
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=200&fit=crop&crop=center",
    alt: "Underground metro subway station",
  },
  bus_station: {
    large:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=400&fit=crop&crop=center",
    small:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=200&fit=crop&crop=center",
    alt: "Electric bus at modern bus station",
  },
  electric_vehicle_charging_station: {
    large:
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=400&fit=crop&crop=center",
    small:
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=300&h=200&fit=crop&crop=center",
    alt: "Electric vehicle charging station",
  },
  taxi_stand: {
    large:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop&crop=center",
    small:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop&crop=center",
    alt: "Taxi stand in urban area",
  },
};

// Fallback placeholder images
const PLACEHOLDER_IMAGES = {
  walking: "/placeholder.svg?height=400&width=800&text=Walking+Paths",
  cycling_routes: "/placeholder.svg?height=400&width=800&text=Cycling+Routes",
  bicycle_store: "/placeholder.svg?height=400&width=800&text=Bike+Rental",
  transit_station: "/placeholder.svg?height=400&width=800&text=Public+Transit",
  train_station: "/placeholder.svg?height=400&width=800&text=Train+Station",
  subway_station: "/placeholder.svg?height=400&width=800&text=Metro+Station",
  bus_station: "/placeholder.svg?height=400&width=800&text=Bus+Station",
  electric_vehicle_charging_station:
    "/placeholder.svg?height=400&width=800&text=EV+Charging",
  taxi_stand: "/placeholder.svg?height=400&width=800&text=Taxi+Stand",
};

// 🚀 OPTIMIZED: Get transport image with Google Photos integration and caching
const imageCache = new Map();

export function getTransportImage(
  type,
  size = "large",
  places = null,
  usePlaceholder = false
) {
  // Create cache key
  const cacheKey = `${type}-${size}-${places?.length || 0}-${usePlaceholder}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  let imageUrl;

  // If we have real places with photos, use the first available photo
  if (places && places.length > 0) {
    for (const place of places) {
      if (place.photos && place.photos.length > 0) {
        const photo = place.photos[0];
        if (photo.url) {
          imageUrl = photo.url;
          break;
        }
      }
    }
  }

  // Fallback to stock images if no Google photos available
  if (!imageUrl) {
    if (usePlaceholder) {
      imageUrl = PLACEHOLDER_IMAGES[type] || "/placeholder.svg";
    } else {
      const imageData = TRANSPORT_IMAGES[type];
      imageUrl = imageData
        ? imageData[size] || imageData.large
        : PLACEHOLDER_IMAGES[type] || "/placeholder.svg";
    }
  }

  // Cache the result
  imageCache.set(cacheKey, imageUrl);

  return imageUrl;
}

// Get multiple images for a transport type (for galleries)
export function getTransportImages(type, places = null, maxImages = 5) {
  const images = [];

  // First, try to get Google Photos from places
  if (places && places.length > 0) {
    places.forEach((place) => {
      if (place.photos && place.photos.length > 0) {
        place.photos.forEach((photo) => {
          if (photo.url && images.length < maxImages) {
            images.push({
              url: photo.url,
              alt: `${place.name} - ${type.replace("_", " ")}`,
              source: "google_places",
              placeName: place.name,
            });
          }
        });
      }
    });
  }

  // Fill remaining slots with stock images if needed
  if (images.length < maxImages) {
    const stockImage = TRANSPORT_IMAGES[type];
    if (stockImage) {
      images.push({
        url: stockImage.large,
        alt: stockImage.alt,
        source: "stock",
        placeName: "Stock Image",
      });
    }
  }

  return images;
}

// Get image alt text
export function getTransportImageAlt(type) {
  const imageData = TRANSPORT_IMAGES[type];
  return imageData?.alt || `${type.replace("_", " ")} transport option`;
}

// Get all available transport types
export function getAvailableTransportTypes() {
  return Object.keys(TRANSPORT_IMAGES);
}

// Check if image URL is valid (for error handling)
export function validateImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Get optimized image URL with parameters
export function getOptimizedImageUrl(
  type,
  width = 300,
  height = 200,
  quality = 80
) {
  const imageData = TRANSPORT_IMAGES[type];
  if (!imageData) return PLACEHOLDER_IMAGES[type];

  const baseUrl = imageData.large.split("?")[0];
  return `${baseUrl}?w=${width}&h=${height}&fit=crop&crop=center&q=${quality}`;
}
