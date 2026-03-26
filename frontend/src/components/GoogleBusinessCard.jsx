import { useState } from 'react'

const GoogleBusinessCard = ({ variant = 'full' }) => {
  const [rating] = useState(4.8)
  const [reviewCount] = useState(25)
  
  // Google Business Profile info
  const businessData = {
    name: 'Puja Samriddhi',
    rating: rating,
    reviewCount: reviewCount,
    googleProfileUrl: 'https://www.google.com/maps/place/Puja+Samriddhi',
    phone: '+919739362962',
    address: 'Bangalore & Bhubaneswar',
    categories: 'Religious Service / Pandit Booking',
  }

  // Render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : i < rating
                ? 'fill-yellow-400/60 text-yellow-400'
                : 'fill-gray-300 text-gray-300'
            }`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12 3.75L14.55 8.92L20.25 9.75L16.12 13.78L17.1 19.45L12 16.77L6.9 19.45L7.88 13.78L3.75 9.75L9.45 8.92L12 3.75Z" />
          </svg>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    // Compact version for Footer
    return (
      <div
        className="rounded-2xl border border-white/10 p-5 backdrop-blur-sm sm:p-6"
        style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)' }}
      >
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-300">Trusted Online</p>
        <h4 className="text-base font-bold sm:text-lg text-white">Google Reviews</h4>
        
        <div className="mt-5 space-y-4">
          {/* Rating Display */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-bold text-white">{businessData.rating}</div>
              <div className="flex items-center gap-1">{renderStars(businessData.rating)}</div>
              <p className="text-xs text-white/60">{businessData.reviewCount} reviews</p>
            </div>
            <div className="h-20 border-l border-white/20" />
            <div className="flex-1 space-y-2 text-sm">
              <p className="text-white/90 font-medium">Puja Samriddhi</p>
              <p className="text-white/65 text-xs">Verified pandit booking service</p>
              <a
                href={businessData.googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 hover:text-white"
              >
                View on Google
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-4 rounded-lg border border-orange-400/20 p-3" style={{ background: 'rgba(234,88,12,0.05)' }}>
          <p className="text-xs font-semibold text-orange-300 mb-2">Why choose us</p>
          <ul className="space-y-1.5 text-xs text-white/70">
            <li className="flex items-center gap-2">
              <svg className="h-3 w-3 text-orange-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Google verified service
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-3 w-3 text-orange-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {businessData.reviewCount}+ verified reviews
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-3 w-3 text-orange-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {businessData.rating} star rating
            </li>
          </ul>
        </div>
      </div>
    )
  }

  // Full version for HomePage
  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div
        className="rounded-3xl border border-white/10 p-8 backdrop-blur-sm sm:p-12"
        style={{
          background: 'linear-gradient(135deg, rgba(234,88,12,0.08) 0%, rgba(217,119,6,0.05) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 32px rgba(234,88,12,0.15)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-2">Google Verified</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Trusted by Families
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Join hundreds of satisfied customers who've booked with us
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Rating and Info */}
          <div className="space-y-6">
            {/* Large Rating */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="text-5xl font-bold text-amber-600">{businessData.rating}</div>
                <div className="flex flex-col justify-center ml-4">
                  <div className="flex gap-1">{renderStars(businessData.rating)}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Based on {businessData.reviewCount} reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Business</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{businessData.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Category</p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{businessData.categories}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Location</p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{businessData.address}</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <a
                href={businessData.googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transition hover:brightness-110"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                View on Google
              </a>
              <a
                href="https://wa.me/919739362962"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-linear-to-r from-green-600 to-green-500 text-white font-semibold shadow-lg hover:shadow-xl transition hover:brightness-110"
              >
                📱 Book Now on WhatsApp
              </a>
            </div>
          </div>

          {/* Right: Review Highlights */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-stone-900 mb-6">What customers say</h3>
            
            {/* Sample Reviews */}
            {[
              {
                author: 'Sasmita Nayak',
                rating: 5,
                text: 'Excellent service! The pandit was very professional and punctual. Would definitely book again.',
              },
              {
                author: 'Subhajit Sen',
                rating: 5,
                text: 'Transparent pricing and smooth booking process. Highly recommended for anyone looking for reliable pandit services.',
              },
              {
                author: 'Neha Sharma',
                rating: 4,
                text: 'Great experience! The team was helpful throughout. Very satisfied with the service.',
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/70 border border-amber-100 shadow-[0_8px_20px_rgba(120,53,15,0.08)] hover:border-amber-300/60 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-stone-900 text-sm">{review.author}</p>
                  <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed">{review.text}</p>
              </div>
            ))}

            <a
              href={businessData.googleProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center mt-6 px-6 py-2 text-amber-600 dark:text-amber-400 font-semibold hover:text-amber-700 transition"
            >
              View all {businessData.reviewCount} reviews on Google →
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 pt-10 border-t border-white/20">
          <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wide">
            Verified by
          </p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1c-6.338 0-12 4.226-12 10.007 0 2.05.738 4.063 2.047 5.625.055 3.215 1.308 4.434 4.282 5.359.527.173 1.166.326 1.814.438.469 1.196 1.545 2.571 3.857 2.571 2.312 0 3.388-1.375 3.857-2.571.648-.112 1.287-.265 1.814-.438 2.974-.925 4.227-2.144 4.282-5.359 1.309-1.562 2.047-3.575 2.047-5.625 0-5.781-5.662-10.007-12-10.007zm0 18.5c-1.933 0-2.567-.866-2.804-2.109-.129-.732.746-1.391 1.511-1.391.391 0 .753.141 1.293.141 1.057 0 1.632-.141 1.632-.141.765 0 1.64.659 1.511 1.391-.237 1.243-.871 2.109-2.804 2.109zm8-10.693c-.229 0-.417-.113-.586-.322-.374.265-.872.429-1.43.429-1.255 0-2.275-1.067-2.275-2.381 0-1.314 1.02-2.382 2.275-2.382.557 0 1.055.164 1.43.43.169-.209.357-.322.586-.322.74 0 1.34.609 1.34 1.36v2.227c0 .752-.6 1.361-1.34 1.361zm-13.414-2.381c0 1.314-1.021 2.381-2.276 2.381-.559 0-1.055-.164-1.429-.429-.169.209-.357.322-.586.322-.74 0-1.34-.609-1.34-1.361v-2.227c0-.751.6-1.36 1.34-1.36.229 0 .417.113.586.322.374-.266.87-.43 1.429-.43 1.255 0 2.276 1.068 2.276 2.382z"/>
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Google Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{businessData.reviewCount}+ Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{businessData.rating} Star Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoogleBusinessCard
