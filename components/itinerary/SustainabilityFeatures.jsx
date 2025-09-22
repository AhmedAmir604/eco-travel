'use client'

import { Leaf } from 'lucide-react'

export default function SustainabilityFeatures({ features }) {
  if (!features || features.length === 0) return null

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Sustainability Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
            <Leaf size={20} className="text-emerald-600" />
            <span className="text-emerald-800 font-medium">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}