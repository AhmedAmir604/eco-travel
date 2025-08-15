'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Clock, Users, Leaf, Star } from "lucide-react"

export default function ItineraryCard({ itinerary, onViewDetails }) {
  const router = useRouter()

  const handleViewFullDetails = () => {
    // Store the itinerary data in sessionStorage for the detail page
    sessionStorage.setItem(`itinerary-${itinerary.id}`, JSON.stringify(itinerary))
    router.push(`/itineraries/${itinerary.id}`)
  }
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={itinerary.image || "/placeholder.svg"}
          alt={itinerary.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1">
          <Leaf size={14} />
          Eco-Friendly
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-700 px-2 py-1 text-sm font-bold rounded-full">
          {itinerary.sustainability?.ecoScore || itinerary.ecoRating || 4.5}/5
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{itinerary.title}</h3>
        
        <div className="flex items-center text-sm text-gray-600 mb-3 gap-4">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{itinerary.duration} days</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{itinerary.travelers || 2} travelers</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400" />
            <span>{typeof itinerary.rating === 'number' ? itinerary.rating.toFixed(1) : '4.5'}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium mb-2 text-gray-700">Highlights:</div>
          <div className="flex flex-wrap gap-1">
            {(itinerary.highlights || itinerary.summary?.highlights || []).slice(0, 3).map((highlight, index) => (
              <span key={index} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                {highlight}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-bold text-emerald-600">
              {itinerary.duration} days
            </div>
            <div className="text-xs text-gray-500">duration</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-emerald-600 mb-1">
              {(itinerary.carbonSaved || itinerary.sustainability?.totalCarbonSaved || 0)}kg CO₂ saved
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewDetails(itinerary)}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                Quick View
              </button>
              <button
                onClick={handleViewFullDetails}
                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Full Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}