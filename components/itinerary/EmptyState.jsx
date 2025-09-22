'use client'

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Icon size={48} className="mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  )
}