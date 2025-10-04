# UI Visual Guide - User Location Features

## Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📍 Enable location for better results                      │
│  Get more accurate suggestions for places near you          │
│  ┌──────────────────┐  ┌─────────────────┐                │
│  │ Enable Location  │  │  Maybe Later    │                │
│  └──────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                     ↓ (when location granted)
┌─────────────────────────────────────────────────────────────┐
│  📍 Search Radius:  [10km] [25km] [50km] [100km] [200km]   │
└─────────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  🔍  [Search for places...]                          ✕ ▼   │
└─────────────────────────────────────────────────────────────┘
                     ↓ (when typing)
┌─────────────────────────────────────────────────────────────┐
│  📍 Liberty Market                                           │
│     Gulberg, Lahore, Pakistan                               │
├─────────────────────────────────────────────────────────────┤
│  📍 Anarkali Bazaar                                          │
│     Old City, Lahore, Pakistan                              │
├─────────────────────────────────────────────────────────────┤
│  📍 Mall of Lahore                                           │
│     Cantt, Lahore, Pakistan                                 │
└─────────────────────────────────────────────────────────────┘
```

## State Variations

### 1. First Visit (Permission Prompt)

```
┌─────────────────────────────────────────────────────────┐
│  🧭 Enable location for better results                  │
│  Get more accurate suggestions for places near you      │
│  ┌─────────────────┐  ┌──────────────┐               │
│  │ Enable Location │  │ Maybe Later  │               │
│  └─────────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────┘

Theme: Blue (bg-blue-50, border-blue-200)
Icon: Navigation (blue)
```

### 2. Location Granted (With Radius Selector)

```
┌─────────────────────────────────────────────────────────┐
│  📍 Search Radius:  10km  25km  [50km]  100km  200km   │
└─────────────────────────────────────────────────────────┘

Theme: Emerald (bg-emerald-50, border-emerald-200)
Icon: MapPinned (emerald)
Active: bg-emerald-600 text-white
Inactive: bg-white text-emerald-700
```

### 3. Location Denied (No Extras)

```
┌─────────────────────────────────────────────────────────┐
│  🔍  [Search for places...]                      ✕  ▼  │
└─────────────────────────────────────────────────────────┘

No prompt, no radius selector
Falls back to default location (Lahore)
```

## Color Scheme

### Location Prompt (Blue Theme)

- **Background**: `#EFF6FF` (blue-50)
- **Border**: `#BFDBFE` (blue-200)
- **Text**: `#1E3A8A` (blue-900)
- **Primary Button**: `#2563EB` (blue-600)
- **Secondary Button**: White with `#93C5FD` border (blue-300)

### Radius Selector (Emerald Theme)

- **Background**: `#ECFDF5` (emerald-50)
- **Border**: `#A7F3D0` (emerald-200)
- **Text**: `#064E3B` (emerald-900)
- **Active Button**: `#059669` (emerald-600) + white text
- **Inactive Button**: White with `#059669` text (emerald-700)

## Responsive Behavior

### Desktop (>768px)

```
┌──────────────────────────────────────────────────────┐
│  📍 Search Radius:  10km  25km  [50km]  100km  200km │
└──────────────────────────────────────────────────────┘
```

All buttons in one row

### Mobile (<768px)

```
┌─────────────────────────────┐
│  📍 Search Radius:          │
│  10km  25km  [50km]         │
│  100km  200km               │
└─────────────────────────────┘
```

Buttons wrap to multiple rows

## Interactive States

### Radius Button States

```
Inactive:  [ 50km ]  ← bg-white text-emerald-700
Hover:     [ 50km ]  ← bg-emerald-100
Active:    [ 50km ]  ← bg-emerald-600 text-white
Focus:     [ 50km ]  ← Focus ring
```

### Location Prompt Actions

```
Enable Location:
  Default → bg-blue-600 text-white
  Hover → bg-blue-700
  Click → Browser permission dialog

Maybe Later:
  Default → bg-white text-blue-600 border-blue-300
  Hover → bg-blue-50
  Click → Prompt disappears
```

## Animation & Transitions

### Prompt Appearance

```javascript
// Smooth slide down
opacity: 0 → 1 (200ms)
transform: translateY(-10px) → translateY(0)
```

### Radius Selection

```javascript
// Instant visual feedback
background: white → emerald-600 (150ms)
color: emerald-700 → white (150ms)
```

### Dropdown Toggle

```javascript
// Chevron rotation
transform: rotate(0deg) → rotate(180deg) (200ms)
```

## Accessibility

### ARIA Labels

```html
<!-- Search Input -->
<input
  role="combobox"
  aria-expanded="true/false"
  aria-haspopup="listbox"
  aria-autocomplete="list"
/>

<!-- Radius Buttons -->
<button type="button" aria-label="Set search radius to 50 kilometers" />

<!-- Location Prompt -->
<button type="button" aria-label="Enable location for better search results" />
```

### Keyboard Navigation

- **Tab**: Navigate between buttons
- **Enter/Space**: Activate button
- **Escape**: Close prompt/dropdown
- **Arrow Keys**: Navigate dropdown items

## Icon Usage

### Navigation Icon (Location Prompt)

```
import { Navigation } from "lucide-react"
<Navigation size={18} className="text-blue-600" />
```

### MapPinned Icon (Radius Selector)

```
import { MapPinned } from "lucide-react"
<MapPinned size={14} className="text-emerald-600" />
```

### MapPin Icon (Results)

```
import { MapPin } from "lucide-react"
<MapPin size={14} className="text-emerald-600" />
```

## User Flow Visualization

```
┌─────────────┐
│  Open Page  │
└──────┬──────┘
       │
       ├─ Permission Unknown ──→ Show Prompt
       │
       ├─ Permission Granted ──→ Show Radius Selector
       │                         + Use GPS Location
       │
       └─ Permission Denied ───→ Use Default Location
                                 + Hide Radius Selector

┌────────────────────┐
│  User Clicks       │
│  "Enable Location" │
└──────┬─────────────┘
       │
       ├─ Grants ──→ Hide Prompt + Show Radius + Use GPS
       │
       └─ Denies ──→ Hide Prompt + Use Default Location
```

## Example: Liberty Market Search (50km radius)

### User in Gulberg, Lahore

**Location**: 31.5204°N, 74.3587°E
**Radius**: 50km

**Results**:

1. Liberty Market (2km away) ✅
2. MM Alam Road (3km away) ✅
3. Packages Mall (5km away) ✅
4. Emporium Mall (8km away) ✅
5. Lahore Fort (10km away) ✅

### Same search with 10km radius

**Results**:

1. Liberty Market (2km away) ✅
2. MM Alam Road (3km away) ✅
3. Packages Mall (5km away) ✅
4. Emporium Mall (8km away) ✅
5. ~~Lahore Fort (10km away)~~ ❌ (outside radius)

## Component Props Visual

```javascript
<CitySearchInput
  // Standard props
  placeholder="Search for places..."
  onCitySelect={handleSelect}
  // New location props
  showRadiusSelector={true} // Show radius bar?
  initialRadius={50} // Default: 50km
/>
```

### Props Impact

```
showRadiusSelector=true + location granted
  ↓
  📍 Search Radius: [10km] [25km] [50km] [100km] [200km]

showRadiusSelector=false OR location denied
  ↓
  (No radius selector shown)

initialRadius=100
  ↓
  📍 Search Radius: 10km 25km 50km [100km] 200km
  (100km is pre-selected)
```

## Error States

### Geolocation Error

```
┌─────────────────────────────────────────────────┐
│  ⚠️  Could not get your location               │
│  Using default location: Lahore, Pakistan      │
└─────────────────────────────────────────────────┘

Falls back to default coordinates gracefully
No scary error messages to user
```

### Timeout

```
10 seconds → Use default location
No blocking, no error message
Smooth fallback experience
```

## Browser Support Visual

| Feature         | Chrome | Firefox | Safari | Edge |
| --------------- | ------ | ------- | ------ | ---- |
| Location Prompt | ✅     | ✅      | ✅     | ✅   |
| Radius Selector | ✅     | ✅      | ✅     | ✅   |
| Permission API  | ✅     | ✅      | ⚠️     | ✅   |
| Geolocation API | ✅     | ✅      | ✅     | ✅   |

**Note**: Safari has limited Permissions API, but everything still works with graceful fallback.

## Development Tips

### Testing Different Permission States

**1. Prompt State (First Time)**

```
Chrome DevTools → Application → Storage → Clear site data
Reload → Should see prompt
```

**2. Granted State**

```
Chrome DevTools → Sensors → Location → Custom
Set coordinates → Should see radius selector
```

**3. Denied State**

```
Address bar → Click 🔒 → Site settings
Block Location → Should use default
```

### Quick Style Tweaks

**Change prompt color to green:**

```jsx
bg-blue-50 → bg-emerald-50
border-blue-200 → border-emerald-200
text-blue-600 → text-emerald-600
```

**Add more radius options:**

```jsx
{[10, 25, 50, 100, 200].map((radius) => ...)}
  ↓
{[5, 10, 25, 50, 100, 200, 500].map((radius) => ...)}
```

**Change default radius:**

```jsx
initialRadius={50} → initialRadius={25}
```

---

**Pro Tip**: Use browser DevTools "Sensors" panel to simulate different locations and test radius behavior without moving physically!
