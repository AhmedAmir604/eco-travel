'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, Leaf, CheckCircle, Loader2 } from 'lucide-react'

const ItineraryGenerationLoader = ({ isVisible, destination, duration, travelers, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [allStepsCompleted, setAllStepsCompleted] = useState(false)

  const steps = [
    {
      id: 'analyzing',
      title: 'Analyzing Your Preferences',
      description: 'Processing your travel requirements and sustainability preferences',
      icon: Users,
      duration: 1000
    },
    {
      id: 'searching',
      title: 'Discovering Eco-Friendly Destinations',
      description: `Finding sustainable activities and accommodations in ${destination}`,
      icon: MapPin,
      duration: 1000
    },
    {
      id: 'optimizing',
      title: 'Optimizing Carbon Footprint',
      description: 'Calculating the most sustainable routes and transport options',
      icon: Leaf,
      duration: 1000
    },
    {
      id: 'scheduling',
      title: 'Creating Your Schedule',
      description: `Organizing ${duration} days of eco-friendly adventures for ${travelers} traveler${travelers > 1 ? 's' : ''}`,
      icon: Calendar,
      duration: 1000
    },
    {
      id: 'finalizing',
      title: 'Finalizing Your Itinerary',
      description: 'Adding sustainability metrics and final touches',
      icon: CheckCircle,
      duration: 1000
    }
  ]

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0)
      setCompletedSteps(new Set())
      setAllStepsCompleted(false)
      return
    }

    let timeoutId
    let currentStepIndex = 0

    const processStep = () => {
      if (currentStepIndex < steps.length) {
        setCurrentStep(currentStepIndex)

        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => new Set([...prev, currentStepIndex]))
          currentStepIndex++

          if (currentStepIndex < steps.length) {
            setTimeout(processStep, 300) // Small delay between steps
          } else {
            // All steps completed
            setTimeout(() => {
              setAllStepsCompleted(true)
              if (onComplete) {
                onComplete()
              }
            }, 500) // Small delay before calling onComplete
          }
        }, steps[currentStepIndex].duration)
      }
    }

    processStep()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isVisible, destination, duration, travelers, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center max-h-screen">
        {/* Header */}
        <div className="">
          {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <Leaf className="w-10 h-10 text-emerald-600" />
          </div> */}
          <p className="text-lg text-gray-600 mt-5 mb-5">
            We're creating a personalized, sustainable travel experience just for you
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === index
            const isCompleted = completedSteps.has(index)
            const isPending = index > currentStep

            return (
              <div
                key={step.id}
                className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-500 ${isCompleted
                  ? 'bg-green-50 border border-green-200'
                  : isActive
                    ? 'bg-emerald-50 border-2 border-emerald-200 shadow-md transform scale-105'
                    : 'bg-gray-50 border border-gray-200'
                  }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                  ? 'bg-green-500 text-white'
                  : isActive
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-300 text-gray-500'
                  }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : isActive ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h3 className={`font-semibold transition-colors duration-300 ${isCompleted
                    ? 'text-green-700'
                    : isActive
                      ? 'text-emerald-700'
                      : 'text-gray-500'
                    }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm mt-1 transition-colors duration-300 ${isCompleted
                    ? 'text-green-600'
                    : isActive
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                    }`}>
                    {step.description}
                  </p>
                </div>

                {isActive && (
                  <div className="flex-shrink-0">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${((completedSteps.size + (currentStep < steps.length ? 0.5 : 0)) / steps.length) * 100}%`
            }}
          ></div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
          </p>
          <p className="text-xs text-gray-400">
            This usually takes 5-10 seconds. Thank you for your patience!
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-green-100 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-emerald-50 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  )
}

export default ItineraryGenerationLoader