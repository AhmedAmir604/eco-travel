import Image from "next/image"

const testimonials = [
  {
    id: 1,
    quote:
      "EcoTravel helped me plan a completely carbon-neutral trip to Costa Rica. The sustainable accommodations and activities they recommended were amazing!",
    name: "Sarah Johnson",
    title: "Environmental Scientist",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    quote:
      "I was able to reduce my carbon footprint by 70% on my last vacation thanks to EcoTravel's transport recommendations and eco-friendly itinerary.",
    name: "Michael Chen",
    title: "Software Engineer",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    quote:
      "As someone who cares deeply about the environment, I was thrilled to find a travel planner that aligns with my values. Highly recommend!",
    name: "Emma Rodriguez",
    title: "Sustainability Consultant",
    avatar: "/placeholder.svg?height=80&width=80",
  },
]

export default function TestimonialSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Travelers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from eco-conscious travelers who have used our platform to plan their sustainable adventures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.title}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
