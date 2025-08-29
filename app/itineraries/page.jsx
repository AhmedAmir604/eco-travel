'use client'

// Removed dummy data import - using only real generated data
import { Calendar, MapPin, Clock, Users, Leaf } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { useState, useEffect } from "react"
import ItineraryCard from "@/components/ItineraryCard"
import ItineraryDetails from "@/components/ItineraryDetails"

// No dummy data - only show generated itineraries

export default function ItinerariesPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedItinerary, setGeneratedItinerary] = useState(null)
  const [selectedItinerary, setSelectedItinerary] = useState(null)
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    travelers: '',
    interests: [],
    budget: 'medium',
    accommodationType: 'eco-hotel',
    transportPreference: 'public',
    sustainabilityLevel: 'high'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerateItinerary = async () => {
    if (!formData.destination || !formData.duration || !formData.travelers) {
      toast.error('Please fill in destination, duration, and number of travelers')
      return
    }

    setIsGenerating(true)
    setGeneratedItinerary(null) // Clear previous itinerary
    try {
      const response = await fetch('/api/itinerary-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          travelers: parseInt(formData.travelers)
        })
      })
      
      const result = await response.json()

      // console.log("result is here ", result);

      if (result.success) {

        setGeneratedItinerary(result.data)
        toast.success('Eco-friendly itinerary generated successfully!')
      } else {
        toast.error(result.error || 'Failed to generate itinerary')
      }
    } catch (error) {
      console.error('Error generating itinerary:', error)
      toast.error('Failed to generate itinerary. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Eco-Friendly Itineraries</h1>
          <p className="text-gray-600 mb-6">
            Discover carefully crafted travel plans that maximize your experience while minimizing environmental impact.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Destination (e.g., Paris, France)"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="Duration (days)"
                min="1"
                max="30"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={formData.travelers}
                onChange={(e) => handleInputChange('travelers', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Travelers</option>
                <option value="1">1 Traveler</option>
                <option value="2">2 Travelers</option>
                <option value="3">3 Travelers</option>
                <option value="4">4+ Travelers</option>
              </select>
              <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">Budget ($)</option>
                <option value="medium">Medium ($$)</option>
                <option value="high">Luxury ($$$)</option>
              </select>
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Advanced preferences */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {['culture', 'nature', 'food', 'adventure', 'history', 'art'].map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      const newInterests = formData.interests.includes(interest)
                        ? formData.interests.filter(i => i !== interest)
                        : [...formData.interests, interest]
                      handleInputChange('interests', newInterests)
                    }}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${formData.interests.includes(interest)
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {interest.charAt(0).toUpperCase() + interest.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport Preference</label>
              <select
                value={formData.transportPreference}
                onChange={(e) => handleInputChange('transportPreference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="public">Public Transit</option>
                <option value="walking">Walking</option>
                <option value="cycling">Cycling</option>
                <option value="electric">Electric Vehicles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sustainability Level</label>
              <select
                value={formData.sustainabilityLevel}
                onChange={(e) => handleInputChange('sustainabilityLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="high">High (Maximum eco-focus)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="low">Low (Some eco-options)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerateItinerary}
              disabled={isGenerating}
              className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Leaf size={16} />
                  Generate Eco-Friendly Itinerary
                </>
              )}
            </button>
          </div>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show generated itinerary if available */}
          {generatedItinerary ? (
            <div className="relative">
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                NEW
              </div>
              <ItineraryCard
                itinerary={{
                  ...generatedItinerary,
                  title: generatedItinerary.title || `Custom ${generatedItinerary.destination} Adventure`,
                  image: "/placeholder.svg",
                  id: generatedItinerary.id // Ensure ID is preserved
                }}
                onViewDetails={setSelectedItinerary}
                showViewFullButton={true}
              />
            </div>
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <Leaf size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Itineraries Yet</h3>
                <p className="text-gray-500">Generate your first eco-friendly itinerary using the form above!</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <nav className="flex items-center">
            <button className="px-3 py-1 border border-gray-300 rounded-l-md text-gray-500 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border-t border-b border-gray-300 bg-green-50 text-green-600 font-medium">
              1
            </button>
            <button className="px-3 py-1 border-t border-b border-gray-300 text-gray-500 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border-t border-b border-gray-300 text-gray-500 hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>

        {/* Itinerary Details Modal */}
        {selectedItinerary && (
          <ItineraryDetails
            itinerary={selectedItinerary}
            onClose={() => setSelectedItinerary(null)}
          />
        )}
      </div>
    </main>
  )
}
