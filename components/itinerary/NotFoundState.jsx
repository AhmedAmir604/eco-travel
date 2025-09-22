'use client'

import { MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFoundState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-400 mb-4">
          <MapPin size={48} className="mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Itinerary Not Found</h3>
          <p className="text-gray-500 mb-4">The requested itinerary data is not available. Please generate a new itinerary.</p>
        </div>
        <Link
          href="/itineraries"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Itineraries
        </Link>
      </div>
    </div>
  )
}