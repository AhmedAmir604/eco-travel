'use client'

export default function DaySelector({ days, selectedDay, onDaySelect }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Select Day to View</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {days?.map((day) => (
          <button
            key={day.day}
            onClick={() => onDaySelect(day.day)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedDay === day.day
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <div className="text-center">
              <div className="font-bold text-lg mb-1">Day {day.day}</div>
              <div className="text-sm mb-2">{day.theme}</div>
              <div className="text-xs text-gray-500">
                {day.activities?.length || 0} activities
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                Eco: {day.sustainabilityScore}/5
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}