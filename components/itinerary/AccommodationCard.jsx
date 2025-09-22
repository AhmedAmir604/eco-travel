'use client'

import { MapPin, Star } from 'lucide-react'

export default function AccommodationCard({ hotel }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {hotel.image && (
        <div className="h-64 bg-gray-200 overflow-hidden">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      )}
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
            <p className="text-gray-600 flex items-center gap-2">
              <MapPin size={16} />
              {hotel.location}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 mb-2">
              <Star size={18} className="text-yellow-400" />
              <span className="text-lg font-semibold">{hotel.rating}</span>
            </div>
            <div className="text-sm text-emerald-600 font-semibold">
              Eco: {hotel.sustainabilityScore}/5
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">{hotel.description}</p>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Eco Features</h4>
            <div className="flex flex-wrap gap-2">
              {hotel.ecoFeatures?.map((feature, idx) => (
                <span key={idx} className="text-sm bg-emerald-100 text-emerald-700 px-3 py-2 rounded-full font-medium">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities?.map((amenity, idx) => (
                <span key={idx} className="text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-full font-medium">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm">
              <span className="text-gray-600">Distance: </span>
              <span className="font-semibold">{hotel.distance?.value} {hotel.distance?.unit}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Carbon: </span>
              <span className="font-semibold text-green-600">{hotel.carbonFootprint}kg CO₂</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}