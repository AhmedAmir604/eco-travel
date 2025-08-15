'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

// Default transport images as fallbacks
const DEFAULT_TRANSPORT_IMAGES = {
  train_station: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop&crop=center',
  subway_station: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop&crop=center',
  bus_station: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop&crop=center',
  transit_station: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop&crop=center',
  electric_vehicle_charging_station: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=300&fit=crop&crop=center',
  taxi_stand: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&crop=center'
}

export default function TransportImageCard({ transport, className = '' }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const getImageUrl = () => {
    if (imageError || !transport.image) {
      return DEFAULT_TRANSPORT_IMAGES[transport.type] || DEFAULT_TRANSPORT_IMAGES.bus_station
    }
    return transport.image
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Transport Image */}
      <div className="h-48 bg-gray-200 overflow-hidden relative">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse flex items-center gap-2">
              <div className="text-2xl">{transport.icon}</div>
              <div className="text-sm text-gray-500">Loading image...</div>
            </div>
          </div>
        )}
        <img
          src={getImageUrl()}
          alt={transport.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: imageLoading ? 'none' : 'block' }}
        />
        
        {/* Overlay with transport type */}
        <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <span className="text-lg">{transport.icon}</span>
          <span>{transport.name}</span>
        </div>
        
        {/* Eco score badge */}
        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          Eco: {transport.ecoScore}/5
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{transport.name}</h3>
          <p className="text-gray-600 text-sm">{transport.description}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-800 font-medium text-sm">Carbon Savings</span>
            <span className="font-bold text-green-600">{transport.carbonSavings}kg CO₂</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-800 font-medium text-sm">Available Locations</span>
            <span className="font-bold text-blue-600">{transport.count} stations</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-700 text-sm">
              <span className="font-semibold">Recommendation:</span> {transport.recommendation}
            </p>
          </div>
        </div>

        {transport.places && transport.places.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Nearby Stations</h4>
            <div className="space-y-2">
              {transport.places.slice(0, 2).map((place, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  {place.image && (
                    <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin size={10} className="text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-xs truncate">{place.name || 'Station'}</span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{place.vicinity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}