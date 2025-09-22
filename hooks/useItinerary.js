'use client'

import { useState, useEffect } from 'react'

export const useItinerary = (id) => {
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)

  const transformItineraryData = (data) => ({
    ...data,
    title: data.title || `Eco-Friendly ${data.destination} Adventure`,
    days: data.days?.map(day => ({
      ...day,
      activities: day.activities?.map(activity => ({
        ...activity,
        coordinates: activity.coordinates || data.coordinates,
        carbonFootprint: parseFloat(activity.carbonFootprint || activity.cost || 0.5),
        time: activity.time || '10:00',
        ecoFeatures: activity.ecoFeatures || ['Eco-friendly', 'Sustainable']
      }))
    })) || []
  })

  const loadItineraryData = async () => {
    setLoading(true)

    try {
      const storedData = sessionStorage.getItem(`itinerary-${id}`)

      if (storedData) {
        const itineraryData = JSON.parse(storedData)
        const transformedItinerary = transformItineraryData(itineraryData)
        setItinerary(transformedItinerary)
      } else {
        console.error('No itinerary data found in sessionStorage')
        setItinerary(null)
      }
    } catch (error) {
      console.error('Error loading itinerary from sessionStorage:', error)
      setItinerary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadItineraryData()
    }
  }, [id])

  return { itinerary, loading, loadItineraryData }
}