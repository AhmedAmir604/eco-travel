import Link from "next/link"
import Image from "next/image"
import { dummyDestinations } from "../data/dummy-data"

export default function FeaturedDestinations() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Eco Destinations</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover these handpicked sustainable destinations that offer unforgettable experiences while minimizing
            environmental impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyDestinations.slice(0, 6).map((destination) => (
            <Link href={`/destinations/${destination.id}`} key={destination.id} className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:shadow-lg">
                <div className="relative h-48 w-full">
                  <Image
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 bg-green-600 text-white px-3 py-1 text-sm font-medium">
                    {destination.ecoRating}/5 Eco Rating
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">
                    {destination.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{destination.location}</p>
                  <p className="text-gray-700 mb-4 line-clamp-2">{destination.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {destination.tags.map((tag) => (
                      <span key={tag} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/destinations"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
          >
            View All Destinations
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
