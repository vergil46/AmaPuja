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
    <section className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <h3 className="text-xl sm:text-2xl font-semibold text-center">Testimonials</h3>
      <div className="grid md:grid-cols-3 gap-5 mt-6">
        {testimonials.map((item) => (
          <article key={item.name} className="card bg-white rounded-2xl border border-orange-100 p-5 flex flex-col items-center text-center shadow hover:shadow-lg transition-shadow animate-fade-up">
            <img
              src={item.photo}
              alt={item.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-orange-200 mb-3 shadow"
              loading="lazy"
            />
            <p className="text-sm text-stone-700">“{item.text}”</p>
            <p className="mt-3 font-medium text-orange-700 text-sm">{item.name}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
