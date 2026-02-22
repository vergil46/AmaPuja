function TrustBadges() {
  const badges = [
    {
      title: '100% Verified Priests',
      description: 'All pandits are background-verified and experienced',
      icon: (
        <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: 'Secure Payment',
      description: 'Multiple payment options with 100% secure transactions',
      icon: (
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: 'Transparent Pricing',
      description: 'No hidden charges, clear package details upfront',
      icon: (
        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your queries',
      icon: (
        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: 'On-Time Service',
      description: 'Punctual service with confirmed priest arrival',
      icon: (
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Multi-Language',
      description: 'Services in Odia, Bengali, Kannada & Hindi traditions',
      icon: (
        <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      )
    }
  ]

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Why Families Trust Ama Puja</h2>
        <p className="text-stone-600 mt-2">Professional puja services with complete peace of mind</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div 
            key={badge.title} 
            className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center"
          >
            <div className="mb-4">
              {badge.icon}
            </div>
            <h3 className="font-semibold text-base sm:text-lg text-stone-800 mb-2">{badge.title}</h3>
            <p className="text-sm text-stone-600">{badge.description}</p>
          </div>
        ))}
      </div>
      
      {/* Stats Section */}
      <div className="mt-10 sm:mt-12 bg-linear-to-r from-orange-50 to-red-50 rounded-2xl p-5 sm:p-8">
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-orange-700">2,450+</div>
            <div className="text-sm text-stone-600 mt-1">Happy Families</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-orange-700">62+</div>
            <div className="text-sm text-stone-600 mt-1">Sacred Rituals</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-orange-700">4.8★</div>
            <div className="text-sm text-stone-600 mt-1">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustBadges
