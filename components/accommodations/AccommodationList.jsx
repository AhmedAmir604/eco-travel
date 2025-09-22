'use client'

import Image from "next/image"
import { MapPin, Star, Wifi, Car, Utensils, Dumbbell, Waves } from "lucide-react"
import AccommodationLikeButton from "@/components/AccommodationLikeButton"
import { useToast } from "@/contexts/ToastContext"

export default function AccommodationList({ 
  accommodations, 
  selectedAccommodation, 
  onAccommodationSelect,
  paginationLoading 
}) {
  const { toast } = useToast()

  const getAmenityIcon = (amenity) => {
    const icons = {
      'Restaurant': <Utensils size={12} />,
      'WiFi': <Wifi size={12} />,
      'Fitness Center': <Dumbbell size={12} />,
      'Swimming Pool': <Waves size={12} />,
      'Parking': <Car size={12} />
    }
    return icons[amenity] || <Star size={12} />
  }

  const getEcoPreference = (accommodation) => {
    const ecoRating = accommodation.ecoRating || 3
    const hasEcoFeatures = accommodation.features?.length || 0

    if (ecoRating >= 4.5 && hasEcoFeatures >= 4) {
      return {
        level: 'excellent',
        label: 'Most Eco-Friendly',
        message: 'Outstanding sustainability practices - Perfect eco choice!',
        bgColor: 'bg-green-600',
        textColor: 'text-white',
        borderColor: 'border-green-500',
        icon: '🌟'
      }
    } else if (ecoRating >= 4 && hasEcoFeatures >= 3) {
      return {
        level: 'very-good',
        label: 'Highly Eco-Friendly',
        message: 'Excellent environmental initiatives - Great choice!',
        bgColor: 'bg-emerald-500',
        textColor: 'text-white',
        borderColor: 'border-emerald-400',
        icon: '✨'
      }
    } else if (ecoRating >= 3.5 && hasEcoFeatures >= 2) {
      return {
        level: 'good',
        label: 'Eco-Friendly',
        message: 'Good sustainability practices - Recommended!',
        bgColor: 'bg-green-500',
        textColor: 'text-white',
        borderColor: 'border-green-400',
        icon: '🌱'
      }
    } else if (ecoRating >= 3) {
      return {
        level: 'moderate',
        label: 'Moderately Eco-Friendly',
        message: 'Some eco-friendly features - Good option!',
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
        borderColor: 'border-yellow-400',
        icon: '⚡'
      }
    } else {
      return {
        level: 'limited',
        label: 'Basic Eco-Friendliness',
        message: 'Limited eco features - Consider other options.',
        bgColor: 'bg-orange-500',
        textColor: 'text-white',
        borderColor: 'border-orange-400',
        icon: '⚠️'
      }
    }
  }

  return (
    <div className={`transition-opacity duration-300 ${paginationLoading ? 'opacity-50' : 'opacity-100'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {accommodations.map((accommodation) => {
          const ecoPreference = getEcoPreference(accommodation)
          const isSelected = selectedAccommodation?.id === accommodation.id
          
          return (
            <div 
              key={accommodation.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                isSelected ? 'border-red-500 ring-2 ring-red-200' : ecoPreference.borderColor
              } relative cursor-pointer transition-all hover:shadow-lg`}
              onClick={() => onAccommodationSelect?.(accommodation)}
            >
              {/* Eco Preference Banner */}
              <div className={`${ecoPreference.bgColor} ${ecoPreference.textColor} px-4 py-2 text-center text-sm font-medium`}>
                <div className="flex items-center justify-center gap-2">
                  <span>{ecoPreference.icon}</span>
                  <span>{ecoPreference.label}</span>
                  {isSelected && <span className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-xs">SELECTED</span>}
                </div>
              </div>

              <div className="md:flex">
                {/* Hotel Image */}
                <div className="md:w-1/2">
                  <div className="relative h-64 md:h-full">
                    <Image
                      src={accommodation.image || "/placeholder.svg"}
                      alt={accommodation.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 text-sm font-medium rounded-full">
                      {accommodation.ecoRating}/5 Eco Rating
                    </div>

                    {/* Like Button */}
                    <div className="absolute top-3 right-3 z-10">
                      <AccommodationLikeButton
                        accommodation={{
                          id: accommodation.id,
                          name: accommodation.name,
                          location: accommodation.location,
                          image: accommodation.image,
                          price: accommodation.pricePerNight ? {
                            amount: accommodation.pricePerNight,
                            currency: accommodation.currency || 'USD',
                            per: 'night'
                          } : null,
                          rating: accommodation.rating,
                          ecoRating: accommodation.ecoRating,
                          description: accommodation.description,
                          chainCode: accommodation.chainCode,
                          features: accommodation.features,
                          amenities: accommodation.amenities,
                          coordinates: accommodation.coordinates,
                          source: 'amadeus'
                        }}
                        size="md"
                        variant="default"
                      />
                    </div>
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="md:w-1/2 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{accommodation.name}</h3>
                    {accommodation.chainCode && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {accommodation.chainCode}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span>{accommodation.location}</span>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{accommodation.description}</p>

                  {/* Eco Preference Message */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="text-sm text-green-800 font-medium">
                      {ecoPreference.icon} {ecoPreference.message}
                    </div>
                  </div>

                  {/* Eco Features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Eco-Friendly Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {accommodation.features.slice(0, 4).map((feature) => (
                        <span key={feature} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                      {accommodation.features.length > 4 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{accommodation.features.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {accommodation.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {getAmenityIcon(amenity)}
                          <span className="ml-1">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distance */}
                  {accommodation.distance && (
                    <div className="mb-4">
                      <span className="text-xs text-gray-500">
                        📍 {accommodation.distance.value?.toFixed(1)} {accommodation.distance.unit} from search center
                      </span>
                    </div>
                  )}

                  {/* Booking Section */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-gray-500 text-sm">
                      Contact for pricing
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(accommodation.name + ' ' + accommodation.location + ' booking')}`, '_blank')
                        toast.info(`Opening booking page for ${accommodation.name}`)
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}