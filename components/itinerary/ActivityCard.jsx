"use client";

import { MapPin, Star, Info, ExternalLink } from "lucide-react";

// Helper function to strip HTML tags and decode HTML entities
function stripHtml(html) {
  if (!html) return "";

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, " ");

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Remove extra whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

export default function ActivityCard({ activity, index, onViewDetails }) {
  if (!activity) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
      <div className="flex flex-col md:flex-row gap-0">
        {/* Activity Image - Only show if image exists */}
        {activity.image && (
          <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0">
            <img
              src={activity.image}
              alt={activity.title || "Activity"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Activity Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-lg">
                {activity.time || "N/A"}
              </div>
              {activity.rating && (
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold">
                    {activity.rating}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {activity.price && activity.price.amount ? (
                  <span>
                    {activity.price.currency || activity.currency || "$"}
                    {activity.price.amount}
                  </span>
                ) : activity.cost ? (
                  <span>${activity.cost}</span>
                ) : (
                  <span>-</span>
                )}
              </div>
              {activity.carbonFootprint && (
                <div className="text-xs text-emerald-600 font-medium mt-1">
                  {activity.carbonFootprint}kg CO₂
                </div>
              )}
            </div>
          </div>

          <h4 className="text-xl font-bold text-gray-900 mb-3">
            {activity.title || "Activity"}
          </h4>
          {activity.description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
              {stripHtml(activity.description)}
            </p>
          )}

          {activity.location && (
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <MapPin size={14} />
              <span className="text-sm">{activity.location}</span>
            </div>
          )}

          {/* Eco Features */}
          {activity.ecoFeatures && activity.ecoFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activity.ecoFeatures.map((feature, featureIdx) => (
                <span
                  key={featureIdx}
                  className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium"
                >
                  🌿 {feature}
                </span>
              ))}
            </div>
          )}

          {/* Activity Categories/Kinds */}
          {activity.kindsArray && activity.kindsArray.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {activity.kindsArray.slice(0, 5).map((kind, kindIdx) => (
                  <span
                    key={kindIdx}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border"
                  >
                    {kind.replace(/_/g, " ")}
                  </span>
                ))}
                {activity.kindsArray.length > 5 && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded border">
                    +{activity.kindsArray.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Booking Link and Additional Info */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
            {activity.bookingLink && (
              <a
                href={activity.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Now
                <ExternalLink size={14} />
              </a>
            )}

            {activity.wikipedia && (
              <a
                href={activity.wikipedia}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                📖 Wikipedia
              </a>
            )}

            {activity.url && !activity.bookingLink && (
              <a
                href={activity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                🔗 More Info
              </a>
            )}

            {activity.wikidata && (
              <a
                href={`https://www.wikidata.org/wiki/${activity.wikidata}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                Wikidata
              </a>
            )}

            {activity.sustainabilityScore && (
              <div className="ml-auto flex items-center gap-2">
                <div className="text-xs text-gray-500">
                  Sustainability:{" "}
                  <span className="font-semibold text-emerald-600">
                    {activity.sustainabilityScore}/5
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Pictures Gallery */}
          {activity.pictures && activity.pictures.length > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-2">
                More Images:
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {activity.pictures.slice(1, 5).map((pic, picIdx) => (
                  <img
                    key={picIdx}
                    src={pic}
                    alt={`${activity.title} ${picIdx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
