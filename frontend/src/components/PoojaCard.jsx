import { Link } from 'react-router-dom'
import { getPoojaImage } from '../assets/poojaImageMap'

function PoojaCard({ pooja, selectedCity }) {
  const customImage = getPoojaImage(pooja.title, pooja.image)
  const cityQuery = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : ''

  return (
    <article className="h-full bg-white rounded-xl overflow-hidden border border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <img
        src={customImage}
        alt={pooja.title}
        className="h-36 sm:h-40 w-full object-cover object-center"
        onError={(event) => {
          event.currentTarget.src = pooja.image
        }}
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg">{pooja.title}</h3>
        <p className="mt-2 text-sm text-stone-600 line-clamp-2">{pooja.description}</p>
        <p className="mt-3 text-orange-700 font-semibold">Starting ₹{pooja.startPrice}</p>
        <Link
          to={`/services/${pooja._id}${cityQuery}`}
          className="inline-block mt-auto pt-3"
        >
          <span className="inline-block px-4 py-2 text-sm rounded-lg bg-stone-900 text-white">View Details</span>
        </Link>
      </div>
    </article>
  )
}

export default PoojaCard
