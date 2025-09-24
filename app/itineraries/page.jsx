'use client'

// Removed dummy data import - using only real generated data
import { Calendar, Users, Leaf } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { useState, useEffect } from "react"
import ItineraryCard from "@/components/ItineraryCard"
import ItineraryDetails from "@/components/ItineraryDetails"
import ItineraryGenerationLoader from "@/components/ItineraryGenerationLoader"
import CitySearchInput from "@/components/CitySearchInput"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "../../styles/calendar.css"

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
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCitySelect = (city) => {
    // Use the city's display name or construct a proper destination string
    const destination = city.displayName || `${city.name}${city.country ? `, ${city.country}` : ''}`
    setFormData(prev => ({ ...prev, destination }))
  }

  const handleGenerateItinerary = async () => {
    if (!formData.destination || !formData.duration || !formData.travelers) {
      toast.error('Please select destination, travel dates, and number of travelers')
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

      // //("result is here ", result);

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Destination</label>
              <CitySearchInput
                placeholder="Search destination..."
                onCitySelect={handleCitySelect}
                onInputChange={(value) => handleInputChange('destination', value)}
                initialValue={formData.destination}
                inputClassName="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                dropdownClassName="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                showPopularCities={true}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Travel Dates</label>
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setStartDate(start);
                    setEndDate(end);
                    if (start && end) {
                      // Calculate duration in days
                      const diffTime = Math.abs(end - start);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      handleInputChange('duration', diffDays.toString());
                      toast.success(`Selected: ${start.toLocaleDateString()} - ${end.toLocaleDateString()} (${diffDays} days)`);
                    }
                  }}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  placeholderText="Select travel dates"
                  dateFormat="MMM d, yyyy"
                  minDate={new Date()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                  wrapperClassName="w-full"
                  calendarClassName="custom-calendar"
                  popperClassName="custom-popper"
                  dayClassName={(date) => {
                    const today = new Date();
                    const isToday = date.toDateString() === today.toDateString();
                    const isPast = date < today;

                    if (isPast) return 'text-gray-300 cursor-not-allowed';
                    if (isToday) return 'bg-emerald-100 text-emerald-800 font-semibold';
                    return 'hover:bg-emerald-50 text-gray-900';
                  }}
                />
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Number of Travelers</label>
              <div className="relative">
                <select
                  value={formData.travelers}
                  onChange={(e) => handleInputChange('travelers', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select travelers</option>
                  <option value="1">1 Traveler</option>
                  <option value="2">2 Travelers</option>
                  <option value="3">3 Travelers</option>
                  <option value="4">4+ Travelers</option>
                </select>
                <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Budget Range</label>
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

        {/* Progressive Loading Screen */}
        <ItineraryGenerationLoader
          isVisible={isGenerating}
          destination={formData.destination}
          duration={parseInt(formData.duration) || 0}
          travelers={parseInt(formData.travelers) || 1}
        />
      </div>
    </main>
  )
}
