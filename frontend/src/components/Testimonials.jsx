function Testimonials() {
  const testimonials = [
    {
      name: 'S. Mishra',
      text: 'The pandit arrived on time and guided every ritual beautifully.',
      photo: '/proofs/work1.jpeg',
    },
    {
      name: 'P. Das',
      text: 'Simple booking and very respectful service for our griha pravesh.',
      photo: '/proofs/work2.jpeg',
    },
    {
      name: 'A. Nayak',
      text: 'Clear pricing and genuine support from start to completion.',
      photo: '/proofs/work3.jpeg',
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Testimonials</h3>
        <p className="mt-2 text-base text-stone-600">Loved by families across our puja services.</p>
      </div>

      <div className="mt-7 grid gap-6 md:grid-cols-3">
        {testimonials.map((item) => (
          <article
            key={item.name}
            className="card animate-fade-up flex flex-col items-center rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <img
              src={item.photo}
              alt={item.name}
              className="mb-3 h-16 w-16 rounded-full border-2 border-orange-200 object-cover shadow-sm"
              loading="lazy"
            />
            <p className="text-sm leading-relaxed text-stone-700 sm:text-base">“{item.text}”</p>
            <p className="mt-3 text-sm font-semibold text-orange-700">{item.name}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
