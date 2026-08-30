import { useEffect, useState } from 'react'
import api from '../services/api'
import { feedbackSocket } from '../services/feedbackSocket'

function Testimonials() {
  const fallbackTestimonials = [
    {
      name: 'S. Mishra',
      text: 'The pandit arrived on time and guided every ritual beautifully.',
      photo: '/proofs/work1.jpeg',
      rating: 5,
    },
    {
      name: 'P. Das',
      text: 'Simple booking and very respectful service for our griha pravesh.',
      photo: '/proofs/work2.jpeg',
      rating: 5,
    },
    {
      name: 'A. Nayak',
      text: 'Clear pricing and genuine support from start to completion.',
      photo: '/proofs/work3.jpeg',
      rating: 5,
    },
  ]

  const [testimonials, setTestimonials] = useState(fallbackTestimonials)

  useEffect(() => {
    let isMounted = true

    const loadTestimonials = () => {
      api
        .get('/feedback?limit=6')
        .then((response) => {
          const items = Array.isArray(response.data) ? response.data : []
          const normalized = items
            .filter((item) => item?.comment)
            .map((item) => ({
              name: item.customerName || 'Verified Customer',
              text: item.comment,
              rating: Number(item.rating || 5),
              photo: item.reviewPhoto || '/proofs/work1.jpeg',
            }))

          if (isMounted && normalized.length > 0) {
            setTestimonials(normalized.slice(0, 6))
          }
        })
        .catch(() => {
          // Keep fallback testimonials when API is unavailable.
        })
    }

    loadTestimonials()
    feedbackSocket.on('feedback:approved', loadTestimonials)
    feedbackSocket.on('feedback:changed', loadTestimonials)
    feedbackSocket.connect()

    return () => {
      isMounted = false
      feedbackSocket.off('feedback:approved', loadTestimonials)
      feedbackSocket.off('feedback:changed', loadTestimonials)
    }
  }, [])

  const renderStars = (rating) => (
    <div className="mt-2 flex items-center justify-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-amber-500' : 'text-stone-300'}>
          ★
        </span>
      ))}
    </div>
  )

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Testimonials</h3>
        <p className="mt-2 text-base text-stone-600">Loved by families across our puja services.</p>
      </div>

      <div className="mt-7 grid gap-6 md:grid-cols-3">
        {testimonials.map((item, index) => (
          <article
            key={`${item.name}-${index}`}
            className="card animate-fade-up flex flex-col items-center rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <img
              src={item.photo}
              alt={item.name}
              className="mb-3 h-16 w-16 rounded-full border-2 border-orange-200 object-cover shadow-sm"
              loading="lazy"
            />
            <p className="text-sm leading-relaxed text-stone-700 sm:text-base">“{item.text}”</p>
            {renderStars(Math.max(1, Math.min(5, Math.round(Number(item.rating || 5)))))}
            <p className="mt-3 text-sm font-semibold text-orange-700">{item.name}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
