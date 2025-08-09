'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/protected-route'
import { User, Mail, Calendar, Shield } from 'lucide-react'

function ProfilePage() {
  const { user, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.user_metadata?.full_name || 'User Profile'}
                </h1>
                <p className="text-sm text-gray-500">Manage your account settings</p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.user_metadata?.full_name || 'Not provided'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Email address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.email}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Member since
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Email verified
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user?.email_confirmed_at 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.email_confirmed_at ? 'Verified' : 'Pending verification'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex justify-between">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-500">Trips Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-500">CO₂ Saved (kg)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-500">Eco Points</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}