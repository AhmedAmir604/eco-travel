# User Location Features

## Overview

Enhanced city search with user-configurable radius and location permission prompts for a Google Maps-like search experience.

## Features Implemented

### 1. **User-Configurable Search Radius**

Users can now select the search radius for location-biased results:

- **Default**: 50km
- **Options**: 10km, 25km, 50km, 100km, 200km
- **Behavior**: Changes take effect immediately on next search

### 2. **Location Permission Prompt**

Friendly UI prompt asking users to enable location for better results:

- **When shown**: On first visit or when permission state is "prompt"
- **Actions**:
  - "Enable Location" - Requests browser geolocation
  - "Maybe Later" - Dismisses prompt (can be shown again)
- **Auto-dismiss**: When permission is granted or denied

### 3. **Permission Tracking**

- Tracks location permission state: `granted`, `denied`, or `prompt`
- Updates UI based on permission changes
- Falls back to default location (Lahore, Pakistan) if denied

## Technical Implementation

### Hook: `useCitySearch`

```javascript
const {
  searchRadius, // Current radius in km
  locationPermission, // Permission state
  showLocationPrompt, // Whether to show prompt
  setSearchRadius, // Function to change radius
  requestLocation, // Function to request location
  dismissLocationPrompt, // Function to hide prompt
} = useCitySearch(300, 50); // debounceMs, initialRadius
```

### Component: `CitySearchInput`

```jsx
<CitySearchInput
  placeholder="Search for places..."
  onCitySelect={handleSelect}
  showRadiusSelector={true} // Show radius selector
  initialRadius={50} // Default radius in km
/>
```

### API: `/api/cities`

Now accepts dynamic radius parameter:

- **Query param**: `radius` (in meters)
- **Default**: 50000 (50km)
- **Example**: `/api/cities?q=market&lat=31.5&lng=74.3&radius=25000`

## User Experience

### First Visit Flow

1. User opens search → Location prompt appears
2. User clicks "Enable Location" → Browser asks permission
3. If granted → Prompt disappears, radius selector appears
4. If denied → Prompt disappears, uses default location

### Radius Selection Flow

1. User sees current radius (default: 50km)
2. User clicks different radius (e.g., 10km)
3. Search immediately uses new radius for location bias
4. Results prioritize places within selected radius

### Permission States

#### Granted

- ✅ Radius selector visible
- ✅ Using user's GPS location
- ✅ Accurate local results

#### Denied

- ❌ Radius selector hidden
- ❌ Using default location (Lahore)
- ℹ️ General results

#### Prompt (Not yet answered)

- 💡 Location prompt visible
- ⏳ Using default location temporarily
- 📍 Waiting for user decision

## Cost Optimization

These features maintain cost-effective API usage:

- **Session tokens**: Still used for 60-70% discount
- **Field masking**: Still requesting minimal data
- **Radius parameter**: Free (part of locationbias)
- **No extra requests**: Permission tracking is client-side only

## Privacy & Security

### Browser Geolocation API

- Requires HTTPS (except localhost)
- User must explicitly grant permission
- Can be revoked anytime in browser settings
- No geolocation data is stored server-side

### Permission Best Practices

- Always ask, never assume
- Provide clear value proposition
- Respect "Maybe Later" response
- Fallback to default location gracefully

## Testing

### Test Permission States

1. **First time user**:
   - Clear browser data for localhost
   - Open app → Should see prompt
2. **Permission granted**:
   - Click "Enable Location"
   - Allow in browser prompt
   - Should see radius selector
3. **Permission denied**:
   - Click "Enable Location"
   - Block in browser prompt
   - Should use default location
4. **Change permission**:
   - Go to browser settings
   - Change location permission
   - Reload page → UI updates

### Test Radius Selection

1. Enable location permission
2. Search for "market"
3. Note results
4. Change radius from 50km to 10km
5. Search again → Should see different/fewer results
6. Change to 200km → Should see more distant results

### Test Fallback Behavior

1. Deny location permission
2. Search should still work
3. Should use default Lahore coordinates
4. Radius selector should not appear

## Code Structure

```
hooks/useCitySearch.js
├── State Management
│   ├── locationPermission (granted/denied/prompt)
│   ├── searchRadius (km)
│   └── showLocationPrompt (boolean)
├── Geolocation Logic
│   ├── getUserLocation() - Request browser location
│   ├── useDefaultLocation() - Fallback to Lahore
│   └── requestLocation() - User-triggered request
└── Permission Tracking
    ├── Permissions API integration
    └── Auto-update on permission change

components/CitySearchInput.jsx
├── Location Prompt UI
│   ├── Friendly message
│   ├── "Enable Location" button
│   └── "Maybe Later" button
└── Radius Selector UI
    ├── Shows only when location granted
    ├── 5 preset options (10-200km)
    └── Visual active state

app/api/cities/route.js
└── Dynamic Radius Support
    ├── Accept radius query param
    ├── Default to 50km if not provided
    └── Apply to locationbias circle
```

## Browser Compatibility

| Feature         | Chrome | Firefox | Safari     | Edge |
| --------------- | ------ | ------- | ---------- | ---- |
| Geolocation API | ✅     | ✅      | ✅         | ✅   |
| Permissions API | ✅     | ✅      | ⚠️ Limited | ✅   |

**Note**: Safari has limited Permissions API support, so permission state detection may not work. The prompt will still appear and geolocation will still function.

## Troubleshooting

### Prompt doesn't appear

- Check if permission already granted/denied
- Clear browser data and retry
- Ensure HTTPS (or localhost)

### Location not accurate

- Check device GPS is enabled
- Grant location permission to browser
- Try increasing timeout in code (currently 10s)

### Radius changes don't affect results

- Verify radius is being sent to API
- Check browser console for API errors
- Ensure location is granted (not using default)

### Default location incorrect

- Update default coordinates in `useDefaultLocation()`
- Currently set to Lahore: `31.5204, 74.3587`

## Future Enhancements

- [ ] Save preferred radius to localStorage
- [ ] Show distance to results in km
- [ ] Custom radius input (not just presets)
- [ ] Map visualization of search radius
- [ ] "Everywhere" option (no radius limit)
- [ ] Remember permission state across sessions
- [ ] Show current location on map

## Related Documentation

- [Location Bias Guide](./LOCATION_BIAS_GUIDE.md)
- [Cost Optimization Guide](./COST_OPTIMIZATION_GUIDE.md)
- [Google Places API Setup](./SUPABASE_SETUP.md)
