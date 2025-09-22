"use client"

import { useState } from "react"
import { Users, Map, Home, Truck, Calendar, BarChart, Settings, PlusCircle, Search, Edit, Trash } from "lucide-react"
import { dummyDestinations } from "@/data/dummy-data"
import AdminProtectedRoute from "@/components/AdminProtectedRoute"
import UserManagement from "@/components/admin/UserManagement"
import { useToast } from "@/hooks/useToast"

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { toast } = useToast()

  const handleAddDestination = () => {
    toast.info('Add destination feature coming soon!')
  }

  const handleEditDestination = (destinationName) => {
    toast.info(`Edit ${destinationName} feature coming soon!`)
  }

  const handleDeleteDestination = (destinationName) => {
    toast.warning(`Delete ${destinationName} feature coming soon!`)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-green-600">EcoTravel Admin</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === "dashboard" ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <BarChart size={18} className="mr-3" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === "destinations" ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("destinations")}
              >
                <Map size={18} className="mr-3" />
                Destinations
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === "accommodations" ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("accommodations")}
              >
                <Home size={18} className="mr-3" />
                Accommodations
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === "transport" ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("transport")}
              >
                <Truck size={18} className="mr-3" />
                Transport
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === "activities" ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("activities")}
              >
                <Calendar size={18} className="mr-3" />
                Activities
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === "users" ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("users")}
              >
                <Users size={18} className="mr-3" />
                Users
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === "settings" ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings size={18} className="mr-3" />
                Settings
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === "destinations" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Manage Destinations</h1>
              <button 
                onClick={handleAddDestination}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <PlusCircle size={18} className="mr-2" />
                Add Destination
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Filter by Region</option>
                  <option value="europe">Europe</option>
                  <option value="asia">Asia</option>
                  <option value="americas">Americas</option>
                  <option value="africa">Africa</option>
                  <option value="oceania">Oceania</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Sort by</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="rating-high">Eco Rating (High to Low)</option>
                  <option value="rating-low">Eco Rating (Low to High)</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Eco Rating
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price Range
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dummyDestinations.map((destination) => (
                      <tr key={destination.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={destination.image || "/placeholder.svg"}
                                alt=""
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{destination.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{destination.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-2">{destination.ecoRating}/5</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`h-4 w-4 ${star <= destination.ecoRating ? "text-yellow-400" : "text-gray-300"}`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${destination.priceRange.min} - ${destination.priceRange.max}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEditDestination(destination.name)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteDestination(destination.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{" "}
                  <span className="font-medium">20</span> results
                </div>
                <div className="flex items-center">
                  <button className="px-3 py-1 border border-gray-300 rounded-l-md text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 border-t border-b border-gray-300 bg-green-50 text-green-600 font-medium">
                    1
                  </button>
                  <button className="px-3 py-1 border-t border-b border-gray-300 text-gray-500 hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <UserManagement />
        )}

        {activeTab === "dashboard" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Destinations</p>
                    <h3 className="text-2xl font-bold">124</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-md">
                    <Map size={20} className="text-green-600" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-green-600">+12% from last month</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Accommodations</p>
                    <h3 className="text-2xl font-bold">356</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-md">
                    <Home size={20} className="text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-green-600">+8% from last month</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Users</p>
                    <h3 className="text-2xl font-bold">2,845</h3>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-md">
                    <Users size={20} className="text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-green-600">+18% from last month</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Carbon Saved (tons)</p>
                    <h3 className="text-2xl font-bold">125.4</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-md">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-xs text-green-600">+22% from last month</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <button className="text-sm text-green-600 hover:text-green-700">View All</button>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <Users size={16} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">User{item}</span> booked an eco-friendly accommodation in Costa
                          Rica
                        </p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Top Eco Destinations</h3>
                  <button className="text-sm text-green-600 hover:text-green-700">View Report</button>
                </div>
                <div className="space-y-4">
                  {dummyDestinations.slice(0, 5).map((destination, index) => (
                    <div key={destination.id} className="flex items-center">
                      <div className="text-sm font-medium w-6 text-gray-500">{index + 1}.</div>
                      <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
                        <img
                          src={destination.image || "/placeholder.svg"}
                          alt={destination.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{destination.name}</p>
                          <p className="text-sm text-gray-500">{destination.ecoRating}/5</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-green-600 h-1.5 rounded-full"
                            style={{ width: `${(destination.ecoRating / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  )
}