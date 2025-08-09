// Loading skeleton component for better UX during API calls

export function TransportCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-gray-200 rounded mr-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-16 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  )
}

export function TransportGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <TransportCardSkeleton key={index} />
      ))}
    </div>
  )
}