function Testimonials() {
  const testimonials = [
    { name: 'S. Mishra', text: 'The pandit arrived on time and guided every ritual beautifully.' },
    { name: 'P. Das', text: 'Simple booking and very respectful service for our griha pravesh.' },
    { name: 'A. Nayak', text: 'Clear pricing and genuine support from start to completion.' },
  ]

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h3 className="text-2xl font-semibold text-center">Testimonials</h3>
      <div className="grid md:grid-cols-3 gap-5 mt-6">
        {testimonials.map((item) => (
          <article key={item.name} className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-sm text-stone-700">“{item.text}”</p>
            <p className="mt-3 font-medium text-orange-700 text-sm">{item.name}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
