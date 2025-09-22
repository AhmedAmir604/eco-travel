'use client'

import { useState } from 'react'

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState('prompt')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationPermission('denied')
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      setIsGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setLocationPermission('granted')
          setIsGettingLocation(false)
          resolve(location)
        },
        (error) => {
          let errorMessage = 'Unable to get your location'
          
          switch(error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = 'Location access denied by user'
              setLocationPermission('denied')
              break
            case 2: // POSITION_UNAVAILABLE
              errorMessage = 'Location information unavailable'
              setLocationPermission('denied')
              break
            case 3: // TIMEOUT
              errorMessage = 'Location request timed out'
              setLocationPermission('denied')
              break
            default:
              errorMessage = 'Unable to get your location'
              setLocationPermission('denied')
              break
          }
          
          setIsGettingLocation(false)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    })
  }

  return {
    userLocation,
    locationPermission,
    isGettingLocation,
    getUserLocation
  }
}