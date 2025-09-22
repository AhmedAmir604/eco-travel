import { MapPin, Calendar, Building2, Car, Navigation } from "lucide-react"

export const ITINERARY_TABS = [
  { id: 'overview', label: 'Overview', icon: MapPin },
  { id: 'itinerary', label: 'Daily Plan', icon: Calendar },
  { id: 'accommodations', label: 'Hotels', icon: Building2 },
  { id: 'transport', label: 'Transport', icon: Car },
  { id: 'map', label: 'Map View', icon: Navigation }
]