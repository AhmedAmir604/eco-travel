import Link from "next/link"
import Image from "next/image"

export default function HeroSection() {
  return (
    <div className="relative bg-green-700 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/placeholder.svg?height=800&width=1600"
          alt="Eco-friendly travel destination"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Travel Sustainably, <br />
          <span className="text-green-300">Explore Responsibly</span>
        </h1>
        <p className="mt-6 max-w-lg text-xl text-white">
          Discover eco-friendly destinations, sustainable accommodations, and low-carbon transport options for your next
          adventure.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/destinations"
            className="px-8 py-3 bg-white text-green-700 font-medium rounded-md shadow hover:bg-gray-100 transition-colors"
          >
            Explore Destinations
          </Link>
          <Link
            href="/how-it-works"
            className="px-8 py-3 bg-transparent text-white font-medium rounded-md border border-white hover:bg-white/10 transition-colors"
          >
            How It Works
          </Link>
        </div>
      </div>
    </div>
  )
}
