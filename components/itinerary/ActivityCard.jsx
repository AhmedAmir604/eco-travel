'use client'

import { MapPin, Star, Info } from 'lucide-react'

export default function ActivityCard({ activity, index, onViewDetails }) {
  return (
    <div className="flex gap-6 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="text-sm font-bold text-blue-600 min-w-[80px] bg-blue-100 px-3 py-2 rounded-lg text-center">
        {activity.time}
      </div>
      <div className="flex-1">
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h4>
            {activity.rating && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400" />
                  <span className="text-sm font-medium">{activity.rating}/5</span>
                </div>
                {activity.wikidata && (
                  <a
                    href={`https://www.wikidata.org/wiki/${activity.wikidata}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    Wikidata: {activity.wikidata}
                  </a>
                )}
              </div>
            )}
          </div>
          {activity.image && (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
        
        {activity.location && (
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <MapPin size={14} />
            <span className="text-sm">{activity.location}</span>
          </div>
        )}

        {/* Activity Categories/Kinds */}
        {activity.kindsArray && activity.kindsArray.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Categories:</div>
            <div className="flex flex-wrap gap-1">
              {activity.kindsArray.slice(0, 6).map((kind, kindIdx) => (
                <span key={kindIdx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border">
                  {kind.replace(/_/g, ' ')}
                </span>
              ))}
              {activity.kindsArray.length > 6 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded border">
                  +{activity.kindsArray.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Eco Features */}
        <div className="flex flex-wrap gap-2 mb-3">
          {activity.ecoFeatures?.map((feature, featureIdx) => (
            <span key={featureIdx} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
              {feature}
            </span>
          ))}
        </div>

        {/* Additional Links */}
        <div className="flex flex-wrap gap-2">
          {activity.wikipedia && (
            <a
              href={activity.wikipedia}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              📖 Wikipedia
            </a>
          )}
          {activity.url && (
            <a
              href={activity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              🔗 More Info
            </a>
          )}
        </div>
      </div>
      <div className="text-right space-y-2">
        <div className="text-lg font-bold text-green-600 mb-1">
          {activity.carbonFootprint}kg CO₂
        </div>
        <div className="text-sm text-gray-500">
          Carbon Impact
        </div>
        <div className="text-sm text-emerald-600 font-medium">
          Eco: {activity.sustainabilityScore}/5
        </div>
        
        {/* View Details Button */}
        {(activity.wikidata || activity.id || activity.coordinates) && (
          <button
            onClick={() => onViewDetails?.(activity)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors mt-2"
          >
            <Info size={12} />
            View Details
          </button>
        )}
      </div>
    </div>
  )
}