'use client'

import { Calendar, TreePine } from 'lucide-react'

export default function TripSummary({ itinerary }) {
  const totalActivities = itinerary.sustainability?.totalActivities || 
    itinerary.days?.reduce((total, day) => total + (day.activities?.length || 0), 0) || 0
  
  const totalCarbonFootprint = Math.round((itinerary.summary?.totalCarbonFootprint || 
    itinerary.days?.reduce((total, day) => total + (day.carbonFootprint || 0), 0) || 0) * 100) / 100
  
  const carbonSaved = Math.round((itinerary.sustainability?.totalCarbonSaved || 
    itinerary.summary?.carbonSaved || 0) * 100) / 100
  
  const ecoActivities = itinerary.sustainability?.ecoFriendlyActivities || 
    itinerary.days?.reduce((total, day) => total + (day.activities?.filter(a => a.sustainabilityScore >= 4).length || 0), 0) || 0
  
  const sustainabilityPercentage = Math.round(itinerary.sustainability?.sustainabilityPercentage || 
    itinerary.summary?.sustainabilityPercentage || 85)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Trip Overview
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-gray-700">Duration:</span>
            <span className="font-semibold text-lg">{itinerary.duration} days</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-gray-700">Travelers:</span>
            <span className="font-semibold text-lg">{itinerary.travelers} people</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-gray-700">Total Activities:</span>
            <span className="font-semibold text-lg">{totalActivities}</span>
          </div>
          <div className="border-t-2 border-blue-200 pt-3 flex justify-between items-center p-3 bg-blue-100 rounded-lg">
            <span className="font-bold text-blue-800">Destination:</span>
            <span className="font-bold text-xl text-blue-800">{itinerary.destination}</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
          <TreePine size={20} />
          Environmental Impact
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-gray-700">Carbon Footprint:</span>
            <span className="font-semibold text-lg">{totalCarbonFootprint}kg CO₂</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-gray-700">Carbon Saved:</span>
            <span className="font-semibold text-lg text-green-600">{carbonSaved}kg CO₂</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-gray-700">Eco Activities:</span>
            <span className="font-semibold text-lg">{ecoActivities}/{totalActivities}</span>
          </div>
          <div className="border-t-2 border-green-200 pt-3 p-3 bg-green-100 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800 mb-1">
                {sustainabilityPercentage}%
              </div>
              <div className="text-sm text-green-700">Sustainability Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}