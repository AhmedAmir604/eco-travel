'use client'

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Heart, MapPin, Star, Loader2, Calendar, Wifi, Car, Utensils, Dumbbell, Waves, Activity, Hotel } from "lucide-react"
import { useLikes } from "@/hooks/useLikes"
import { useAccommodationLikes } from "@/hooks/useAccommodationLikes"
import { useToast } from "@/contexts/ToastContext"
import Pagination from "@/components/Pagination"
import LikeButton from "@/components/LikeButton"
import AccommodationLikeButton from "@/components/AccommodationLikeButton"

// Tab configuration for easy extension
const TABS = [
  {
    id: 'activities',
    label: 'Activities',
    icon: Activity,
    emptyMessage: 'No favorite activities yet',
    emptyDescription: 'Start exploring eco-friendly activities and save your favorites by clicking the heart icon.',
    exploreLink: '/destinations',
    exploreText: 'Explore Activities'
  },
  {
    id: 'accommodations',
    label: 'Accommodations',
    icon: Hotel,
    emptyMessage: 'No favorite accommodations yet',
    emptyDescription: 'Start exploring eco-friendly accommodations and save your favorites by clicking the heart icon.',
    exploreLink: '/accommodations',
    exploreText: 'Explore Accommodations'
  }
  // Future tabs can be added here:
  // {
  //   id: 'transport',
  //   label: 'Transport',
  //   icon: Car,
  //   emptyMessage: 'No favorite transport options yet',
  //   emptyDescription: 'Start exploring eco-friendly transport and save your favorites.',
  //   exploreLink: '/transport',
  //   exploreText: 'Explore Transport'
  // }
]

export default function UnifiedFavoritesPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('activities')
  const [currentPage, setCurrentPage] = useState(1)
  const resultsPerPage = 6

  // Activity favorites hooks
  const { 
    getLikedActivities, 
    loading: activitiesLoading, 
    isAuthenticated: isActivitiesAuth, 
    getLikesCount
  } = useLikes()

  // Accommodation favorites hooks
  const { 
    getLikedAccommodations, 
    loading: accommodationsLoading, 
    isAuthenticated: isAccommodationsAuth, 
    getAccommodationLikesCount
  } = useAccommodationLikes()

  // Unified state management
  const [favorites, setFavorites] = useState([])
  const [pagination, setPagination] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)

  // Check authentication (either hook can provide auth status)
  const isAuthenticated = isActivitiesAuth() || isAccommodationsAuth()

  // Load favorites based on active tab
  const loadFavorites = async (tab = activeTab, page = currentPage) => {
    if (!isAuthenticated) {
      setInitialLoading(false)
      return
    }

    try {
      setInitialLoading(true)
      let result

      if (tab === 'activities') {
        result = await getLikedActivities(page, resultsPerPage)
      } else if (tab === 'accommodations') {
        result = await getLikedAccommodations(page, resultsPerPage)
      }

      setFavorites(result?.data || [])
      setPagination(result?.pagination || null)
    } catch (error) {
      console.error(`Error loading ${tab} favorites:`, error)
      toast.error(`Failed to load your favorite ${tab}`)
    } finally {
      setInitialLoading(false)
    }
  }

  // Load favorites when tab or page changes
  useEffect(() => {
    loadFavorites()
  }, [activeTab, currentPage])

  // Reset page when switching tabs
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const refreshFavorites = async () => {
    await loadFavorites(activeTab, currentPage)
  }

  const getAmenityIcon = (amenity) => {
    const icons = {
      'Restaurant': <Utensils size={12} />,
      'WiFi': <Wifi size={12} />,
      'Fitness Center': <Dumbbell size={12} />,
      'Swimming Pool': <Waves size={12} />,
      'Parking': <Car size={12} />
    }
    return icons[amenity] || <Star size={12} />
  }

  // Get current tab configuration
  const currentTabConfig = TABS.find(tab => tab.id === activeTab)

  // Get total count for current tab
  const getTotalCount = () => {
    if (activeTab === 'activities') return getLikesCount()
    if (activeTab === 'accommodations') return getAccommodationLikesCount()
    return 0
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
            <Heart size={64} className="mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-lg text-gray-600 mb-8">
              Please sign in to view your favorite eco-friendly travel options.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Favorites
              </h1>
              {/* <p className="text-lg text-gray-600">
                {initialLoading 
                  ? 'Loading your saved items...' 
                  : `${getTotalCount()} eco-friendly ${activeTab} you've saved for later`
                }
              </p> */}
            </div>
            {/* <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-600">
                <Heart size={20} className="fill-current" />
                <span className="font-semibold">{getTotalCount()}</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {TABS.map((tab) => {
                const IconComponent = tab.icon
                const isActive = activeTab === tab.id
                const count = tab.id === 'activities' ? getLikesCount() : 
                            tab.id === 'accommodations' ? getAccommodationLikesCount() : 0

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${isActive 
                        ? 'border-green-500 text-green-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <IconComponent 
                      size={20} 
                      className={`mr-2 ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}`} 
                    />
                    {tab.label}
                    {count > 0 && (
                      <span className={`
                        ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                        ${isActive 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {initialLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your favorite {activeTab}...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!initialLoading && favorites.length === 0 && currentTabConfig && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {currentTabConfig.emptyMessage}
              </h3>
              <p className="text-gray-600 mb-6">
                {currentTabConfig.emptyDescription}
              </p>
              <Link
                href={currentTabConfig.exploreLink}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                {currentTabConfig.exploreText}
              </Link>
            </div>
          </div>
        )}

        {/* Favorites Content */}
        {!initialLoading && favorites.length > 0 && (
          <>
            {/* Activities Grid */}
            {activeTab === 'activities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="group">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                      <div className="relative h-56 w-full">
                        <Image
                          src={favorite.activity_image_url || "/placeholder.svg"}
                          alt={favorite.activity_name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        
                        {/* Like Button */}
                        <div className="absolute top-4 right-4 z-10">
                          <LikeButton 
                            activity={{
                              id: favorite.activity_id,
                              name: favorite.activity_name,
                              location: favorite.activity_location,
                              image: favorite.activity_image_url,
                              price: favorite.activity_price,
                              rating: favorite.activity_rating,
                              description: favorite.activity_description,
                              isRealData: favorite.activity_source === 'amadeus'
                            }}
                            size="md"
                            variant="default"
                            onToggle={refreshFavorites}
                          />
                        </div>
                        
                        {/* Price Badge */}
                        {favorite.activity_price && (
                          <div className="absolute top-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 shadow-sm">
                            {favorite.activity_price.amount} {favorite.activity_price.currency}
                          </div>
                        )}
                        
                        {/* Source Badge */}
                        {favorite.activity_source === 'amadeus' && (
                          <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Live Data
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                          {favorite.activity_name}
                        </h3>
                        
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin size={16} className="mr-2 text-green-500" />
                          <span className="text-sm">{favorite.activity_location}</span>
                        </div>
                        
                        {favorite.activity_description && (
                          <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                            {favorite.activity_description}
                          </p>
                        )}
                        
                        {/* Saved Date */}
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                          <Calendar size={14} className="mr-1" />
                          <span>Saved on {formatDate(favorite.created_at)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="flex items-center">
                            {favorite.activity_rating ? (
                              <div className="flex items-center">
                                <Star size={16} className="text-yellow-400 fill-current mr-1" />
                                <span className="text-sm font-semibold text-gray-900">
                                  {favorite.activity_rating}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">rating</span>
                              </div>
                            ) : (
                              <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                                Eco Activity
                              </span>
                            )}
                          </div>
                          
                          <Link
                            href={`/activities/${favorite.activity_id}`}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Accommodations Grid */}
            {activeTab === 'accommodations' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="group">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                      <div className="relative h-56 w-full">
                        <Image
                          src={favorite.accommodation_image_url || "/placeholder.svg"}
                          alt={favorite.accommodation_name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        
                        {/* Like Button */}
                        <div className="absolute top-4 right-4 z-10">
                          <AccommodationLikeButton 
                            accommodation={{
                              id: favorite.accommodation_id,
                              name: favorite.accommodation_name,
                              location: favorite.accommodation_location,
                              image: favorite.accommodation_image_url,
                              price: favorite.accommodation_price,
                              rating: favorite.accommodation_rating,
                              ecoRating: favorite.accommodation_eco_rating,
                              description: favorite.accommodation_description,
                              chainCode: favorite.accommodation_chain_code,
                              features: favorite.accommodation_features,
                              amenities: favorite.accommodation_amenities,
                              coordinates: favorite.accommodation_coordinates,
                              source: favorite.accommodation_source
                            }}
                            size="md"
                            variant="default"
                            onToggle={refreshFavorites}
                          />
                        </div>
                        
                        {/* Eco Rating Badge */}
                        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                          {favorite.accommodation_eco_rating}/5 Eco Rating
                        </div>
                        
                        {/* Regular Rating Badge */}
                        {favorite.accommodation_rating && (
                          <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <Star size={12} className="text-yellow-400 fill-current mr-1" />
                            {favorite.accommodation_rating}
                          </div>
                        )}
                        
                        {/* Chain Code Badge */}
                        {favorite.accommodation_chain_code && (
                          <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-75 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {favorite.accommodation_chain_code}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                          {favorite.accommodation_name}
                        </h3>
                        
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin size={16} className="mr-2 text-green-500" />
                          <span className="text-sm">{favorite.accommodation_location}</span>
                        </div>
                        
                        {favorite.accommodation_description && (
                          <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                            {favorite.accommodation_description}
                          </p>
                        )}

                        {/* Eco Features */}
                        {favorite.accommodation_features && favorite.accommodation_features.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Eco Features</h4>
                            <div className="flex flex-wrap gap-1">
                              {favorite.accommodation_features.slice(0, 3).map((feature, index) => (
                                <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  {feature}
                                </span>
                              ))}
                              {favorite.accommodation_features.length > 3 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                  +{favorite.accommodation_features.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Amenities */}
                        {favorite.accommodation_amenities && favorite.accommodation_amenities.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Amenities</h4>
                            <div className="flex flex-wrap gap-2">
                              {favorite.accommodation_amenities.slice(0, 4).map((amenity, index) => (
                                <div key={index} className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                  {getAmenityIcon(amenity)}
                                  <span className="ml-1">{amenity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Saved Date */}
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                          <Calendar size={14} className="mr-1" />
                          <span>Saved on {formatDate(favorite.created_at)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="flex items-center">
                            <span className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
                              Eco-Friendly Hotel
                            </span>
                          </div>
                          
                          <button
                            onClick={() => {
                              window.open(`https://www.google.com/search?q=${encodeURIComponent(favorite.accommodation_name + ' ' + favorite.accommodation_location + ' booking')}`, '_blank')
                              toast.info(`Opening booking page for ${favorite.accommodation_name}`)
                            }}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={resultsPerPage}
                  onPageChange={handlePageChange}
                  className="flex justify-center"
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}