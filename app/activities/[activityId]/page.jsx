'use client'

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { MapPin, Calendar, Users, Clock, Star, ExternalLink, ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/contexts/ToastContext"
// ToastContainer is now global in layout
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function ActivityDetailPage({ params }) {
  const { toast } = useToast()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    loadActivityDetails()
  }, [params.activityId])

  const loadActivityDetails = async () => {
    try {
      const response = await fetch(`/api/activities/${params.activityId}`)
      const data = await response.json()
      
      if (data.success) {
        setActivity(data.data)
      } else {
        toast.error('Activity not found')
      }
    } catch (error) {
      console.error('Error loading activity:', error)
      toast.error('Error loading activity details')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!activity) return

    setBookingLoading(true)
    
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (activity.bookingLink && activity.bookingLink !== '#') {
        // Open external booking link
        window.open(activity.bookingLink, '_blank')
        toast.success('Redirected to booking platform')
      } else {
        // Mock booking success
        toast.success('Booking initiated! You will receive confirmation shortly.')
      }
    } catch (error) {
      toast.error('Booking failed. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading activity details...</p>
        </div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Activity Not Found</h1>
          <p className="text-gray-600 mb-6">The activity you're looking for doesn't exist.</p>
          <Link
            href="/destinations"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Back to Destinations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Section */}
      <div className="relative h-96">
        <Image
          src={activity.images?.[0] || activity.image || "/placeholder.svg"}
          alt={activity.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/destinations"
              className="inline-flex items-center mb-4 text-white hover:text-green-200 transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Destinations
            </Link>
            <div className="flex items-center mb-2">
              <MapPin size={18} className="mr-2" />
              <span>{activity.location}</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{activity.name}</h1>
            <div className="flex items-center">
              {activity.rating && (
                <div className="flex items-center mr-4">
                  <Star size={18} className="text-yellow-400 fill-current mr-1" />
                  <span className="text-lg font-medium">{activity.rating}</span>
                </div>
              )}
              {activity.price && (
                <div className="text-2xl font-bold">
                  {activity.price.amount} {activity.price.currency}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">About This Activity</h2>
              <p className="text-gray-700 mb-6">{activity.description}</p>
              
              {activity.longDescription && activity.longDescription !== activity.description && (
  <div className="mb-6">
    <h3 className="text-xl font-semibold mb-3">Detailed Description</h3>
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: activity.longDescription }}
    />
  </div>
)}

              {/* Activity Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {activity.duration && (
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Clock size={24} className="text-green-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-800">Duration</div>
                    <div className="text-xs text-gray-600">{activity.duration}</div>
                  </div>
                )}
                {activity.category && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-sm font-medium text-gray-800">Category</div>
                    <div className="text-xs text-gray-600">{activity.category}</div>
                  </div>
                )}
                {activity.minimumAge && (
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Users size={24} className="text-purple-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-800">Min Age</div>
                    <div className="text-xs text-gray-600">{activity.minimumAge}+ years</div>
                  </div>
                )}
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <div className="text-2xl mb-1">♿</div>
                  <div className="text-sm font-medium text-gray-800">Accessibility</div>
                  <div className="text-xs text-gray-600">
                    {activity.wheelchair ? 'Wheelchair accessible' : 'Limited access'}
                  </div>
                </div>
              </div>

              {/* Highlights */}
              {activity.highlights && activity.highlights.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Highlights</h3>
                  <ul className="space-y-2">
                    {activity.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What's Included */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {activity.included && activity.included.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-800">✅ What's Included</h3>
                    <ul className="space-y-1">
                      {activity.included.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activity.notIncluded && activity.notIncluded.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-800">❌ What's Not Included</h3>
                    <ul className="space-y-1">
                      {activity.notIncluded.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {activity.requirements && activity.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                  <ul className="space-y-1">
                    {activity.requirements.map((requirement, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-orange-600 mr-2">⚠️</span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cancellation Policy */}
              {activity.cancellation && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Cancellation Policy</h3>
                  <p className="text-sm text-gray-700">{activity.cancellation}</p>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:w-80">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
                <div className="text-center mb-6">
                  {activity.price ? (
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {activity.price.amount} {activity.price.currency}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-green-600 mb-2">Free Activity</div>
                  )}
                  {activity.rating && (
                    <div className="flex items-center justify-center">
                      <Star size={16} className="text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-medium">{activity.rating} rating</span>
                    </div>
                  )}
                </div>

                {/* Booking Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar size={16} className="inline mr-2" />
                      Select Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => {
                          setSelectedDate(date);
                          if (date) {
                            toast.success(`Selected date: ${date.toLocaleDateString()}`);
                          }
                        }}
                        placeholderText="Select activity date"
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
                        size={16} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 pointer-events-none" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users size={16} className="inline mr-2" />
                      Number of People
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option>1 Person</option>
                      <option>2 People</option>
                      <option>3 People</option>
                      <option>4 People</option>
                      <option>5+ People</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {bookingLoading ? (
                    <Loader2 size={20} className="animate-spin mr-2" />
                  ) : (
                    <Calendar size={20} className="mr-2" />
                  )}
                  {bookingLoading ? 'Processing...' : 'Book This Activity'}
                </button>

                {activity.bookingLink && activity.bookingLink !== '#' && (
                  <div className="mt-4 text-center">
                    <a
                      href={activity.bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-600 hover:text-green-700 text-sm"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      External Booking Platform
                    </a>
                  </div>
                )}

                {/* Eco-Friendly Badge */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🌱</span>
                    </div>
                    <h4 className="font-semibold text-green-800">Eco-Friendly Activity</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    This activity supports sustainable tourism and local communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Images */}
        {activity.images && activity.images.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">More Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activity.images.slice(1).map((image, index) => (
                <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${activity.name} - Photo ${index + 2}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast Container is now global in layout */}
    </main>
  )
}