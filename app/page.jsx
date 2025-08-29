'use client'

import Link from "next/link"
import { Search, Calendar } from "lucide-react"
import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "../styles/calendar.css"
import HeroSection from "../components/hero-section"
import FeaturedDestinations from "../components/featured-destinations"
import EcoStats from "../components/eco-stats"
import TestimonialSection from "../components/testimonial-section"
import CitySearchInput from "../components/CitySearchInput"
import { useToast } from "@/hooks/useToast"
import ToastContainer from "@/components/ToastContainer"

export default function Home() {
  const { toasts, toast, removeToast } = useToast()
  const [selectedDestination, setSelectedDestination] = useState("")
  const [selectedCityCoordinates, setSelectedCityCoordinates] = useState(null)
  const [travelers, setTravelers] = useState("1")
  const [checkInDate, setCheckInDate] = useState(null)
  const [checkOutDate, setCheckOutDate] = useState(null)

  const handleSearch = () => {
    if (selectedDestination.trim()) {
      const dateString = checkInDate && checkOutDate 
        ? `${checkInDate.toLocaleDateString()} - ${checkOutDate.toLocaleDateString()}`
        : ''
      
      const params = new URLSearchParams({
        city: selectedDestination.trim(),
        travelers: travelers,
        dates: dateString,
        checkIn: checkInDate ? checkInDate.toISOString().split('T')[0] : '',
        checkOut: checkOutDate ? checkOutDate.toISOString().split('T')[0] : ''
      })
      
      // Add coordinates if available
      if (selectedCityCoordinates && selectedCityCoordinates.latitude && selectedCityCoordinates.longitude) {
        params.append('latitude', selectedCityCoordinates.latitude.toString())
        params.append('longitude', selectedCityCoordinates.longitude.toString())
      }
      
      window.location.href = `/destinations?${params.toString()}`
    } else {
      toast.warning('Please select a destination')
    }
  }

  return (
    <main className="min-h-screen">
      <HeroSection />

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto -mt-8 px-4 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <CitySearchInput
                placeholder="Where do you want to go?"
                initialValue={selectedDestination}
                onCitySelect={(city) => {
                  const cityName = city.displayName || city.name
                  setSelectedDestination(cityName)
                  
                  // Store coordinates if available
                  if (city.latitude && city.longitude) {
                    setSelectedCityCoordinates({
                      latitude: city.latitude,
                      longitude: city.longitude
                    })
                  } else {
                    setSelectedCityCoordinates(null)
                  }
                  
                  toast.success(`Selected: ${cityName}`)
                }}
                onInputChange={(value) => {
                  setSelectedDestination(value)
                  // Clear coordinates when manually typing
                  if (selectedCityCoordinates) {
                    setSelectedCityCoordinates(null)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selectedDestination) {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                showPopularCities={true}
                className="w-full"
                inputClassName="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                dropdownClassName="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="dates" className="block text-sm font-medium text-gray-700 mb-1">
                Dates
              </label>
              <div className="relative">
                <DatePicker
                  selected={checkInDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setCheckInDate(start);
                    setCheckOutDate(end);
                    if (start && end) {
                      toast.success(`Selected: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
                    }
                  }}
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  selectsRange
                  placeholderText="Select check-in and check-out dates"
                  dateFormat="MMM d, yyyy"
                  minDate={new Date()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  wrapperClassName="w-full"
                  calendarClassName="custom-calendar"
                  popperClassName="custom-popper"
                  dayClassName={(date) => {
                    const today = new Date();
                    const isToday = date.toDateString() === today.toDateString();
                    const isPast = date < today;
                    
                    if (isPast) return 'text-gray-300 cursor-not-allowed';
                    if (isToday) return 'bg-green-100 text-green-800 font-semibold';
                    return 'hover:bg-green-50 text-gray-900';
                  }}
                />
                <Calendar 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 pointer-events-none" 
                />
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="travelers" className="block text-sm font-medium text-gray-700 mb-1">
                Travelers
              </label>
              <select
                id="travelers"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="1">1 Traveler</option>
                <option value="2">2 Travelers</option>
                <option value="3">3 Travelers</option>
                <option value="4">4+ Travelers</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Search size={18} />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Plan Your Eco-Friendly Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Eco Destinations</h3>
              <p className="text-gray-600">
                Find sustainable destinations that prioritize environmental conservation and local communities.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Itineraries</h3>
              <p className="text-gray-600">
                Get custom eco-friendly travel plans tailored to your preferences and environmental values.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduce Your Footprint</h3>
              <p className="text-gray-600">
                Track and minimize your carbon footprint with eco-friendly transport and accommodation options.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedDestinations />
      <EcoStats />
      <TestimonialSection />

      {/* CTA Section */}
      <section className="bg-green-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Sustainable Journey Today</h2>
          <p className="text-lg mb-8">
            Join thousands of eco-conscious travelers making a positive impact on our planet.
          </p>
          <Link
            href="/signup"
            className="px-8 py-3 bg-white text-green-700 font-semibold rounded-md hover:bg-gray-100 transition-colors"
          >
            Sign Up for Free
          </Link>
        </div>
      </section>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  )
}
