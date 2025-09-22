'use client'

import { Leaf } from 'lucide-react'

export default function SustainabilityMetrics({ sustainability, summary, days }) {
  const carbonSaved = Math.round((sustainability?.totalCarbonSaved || summary?.carbonSaved || 0))
  const ecoScore = sustainability?.ecoScore || summary?.sustainabilityRating || 4.5
  const sustainabilityPercentage = Math.round(sustainability?.sustainabilityPercentage || summary?.sustainabilityPercentage || 85)
  const totalDays = days?.length || 0

  return (
    <div className="bg-emerald-50 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-3">
        <Leaf size={24} />
        Sustainability Impact
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-600 mb-2">
            {carbonSaved}kg
          </div>
          <div className="text-sm text-gray-600">CO₂ Saved</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-600 mb-2">
            {ecoScore}/5
          </div>
          <div className="text-sm text-gray-600">Eco Score</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-600 mb-2">
            {sustainabilityPercentage}%
          </div>
          <div className="text-sm text-gray-600">Sustainable</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-600 mb-2">
            {totalDays}
          </div>
          <div className="text-sm text-gray-600">Days</div>
        </div>
      </div>
    </div>
  )
}