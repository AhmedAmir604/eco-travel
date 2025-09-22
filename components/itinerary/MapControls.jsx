'use client'

export default function MapControls({ 
  userLocation, 
  locationPermission, 
  isGettingLocation,
  showUserLocationRoutes, 
  routeMode, 
  getUserLocation, 
  setShowUserLocationRoutes, 
  setRouteMode 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Location & Route Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Get User Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Your Location</label>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await getUserLocation()
                } catch (error) {
                  // Error is already handled by the hook, just ignore here
                  // The UI will update based on locationPermission state
                }
              }}
              disabled={locationPermission === 'denied' || isGettingLocation}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                userLocation
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : locationPermission === 'denied'
                  ? 'bg-red-100 text-red-700 border border-red-300 cursor-not-allowed'
                  : isGettingLocation
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
              }`}
            >
              {userLocation ? '✅ Location Found' : 
               locationPermission === 'denied' ? '❌ Access Denied' : 
               isGettingLocation ? '⏳ Getting Location...' : 
               '📍 Get My Location'}
            </button>
          </div>

          {locationPermission === 'denied' && (
            <p className="text-xs text-red-600">
              Location access denied. Please enable location permissions in your browser settings and refresh the page.
            </p>
          )}
        </div>

        {/* Show Routes Toggle */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Route Display</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUserLocationRoutes(!showUserLocationRoutes)}
              disabled={!userLocation}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showUserLocationRoutes
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              } ${!userLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {showUserLocationRoutes ? '🗺️ Routes Enabled' : '🗺️ Enable Routes'}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Click activities to get directions from your location
          </p>
        </div>

        {/* Travel Mode Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Travel Mode</label>
          <select
            value={routeMode}
            onChange={(e) => setRouteMode(e.target.value)}
            disabled={!userLocation || !showUserLocationRoutes}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              !userLocation || !showUserLocationRoutes ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
            }`}
          >
            <option value="WALKING">🚶 Walking</option>
            <option value="DRIVING">🚗 Driving</option>
            <option value="TRANSIT">🚌 Public Transit</option>
          </select>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 mt-0.5">💡</div>
          <div className="text-sm text-blue-800">
            <strong>How to use:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Click "Get My Location" to enable location services</li>
              <li>Enable routes to show your location on the map</li>
              <li>Select your preferred travel mode</li>
              <li>Click any activity marker to get directions from your location</li>
            </ol>
          </div>
        </div>
      </div>


    </div>
  )
}