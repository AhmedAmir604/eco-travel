export default function EcoStats() {
  return (
    <section className="py-16 px-4 bg-green-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Making a Difference Together</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our community of eco-travelers is helping to reduce carbon emissions and support sustainable tourism around
            the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">15,000+</div>
            <p className="text-gray-600">Eco-Friendly Trips Planned</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">250,000+</div>
            <p className="text-gray-600">kg CO₂ Emissions Saved</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">1,200+</div>
            <p className="text-gray-600">Sustainable Accommodations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
            <p className="text-gray-600">Lower Carbon Footprint</p>
          </div>
        </div>
      </div>
    </section>
  )
}
