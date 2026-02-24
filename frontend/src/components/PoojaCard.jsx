import { Link } from 'react-router-dom'
import { getPoojaImage } from '../assets/poojaImageMap'

function PoojaCard({ pooja, selectedCity }) {
  const customImage = getPoojaImage(pooja.title, pooja.image)
  const cityQuery = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : ''

  return (
    <article className="card group h-full bg-white rounded-2xl overflow-hidden border border-orange-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative overflow-hidden">
        <img
          src={customImage}
          alt={pooja.title}
          loading="lazy"
          className="h-44 sm:h-44 w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = pooja.image
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base sm:text-lg leading-snug text-stone-900 line-clamp-2">{pooja.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 line-clamp-2">{pooja.description}</p>
        <p className="mt-3 text-sm sm:text-base text-orange-700 font-semibold">Starting ₹{pooja.startPrice}</p>
        <Link
          to={`/services/${pooja._id}${cityQuery}`}
          className="inline-block mt-auto pt-4"
        >
          <span className="inline-block w-full sm:w-auto text-center px-4 py-2.5 text-sm rounded-lg bg-linear-to-r from-stone-900 to-stone-700 text-white shadow-sm group-hover:shadow-md">
            View Details
          </span>
        </Link>
      </div>
    </article>
  )
}

export default PoojaCard
