import { Link } from 'react-router-dom'
import { getPoojaImage } from '../assets/poojaImageMap'

function PoojaCard({ pooja, selectedCity }) {
  const customImage = getPoojaImage(pooja.title, pooja.image)
  const cityQuery = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : ''

  return (
    <article className="bg-white rounded-xl overflow-hidden border border-orange-100 hover:shadow-lg transition">
      <img
        src={customImage}
        alt={pooja.title}
        className="h-44 w-full object-cover"
        onError={(event) => {
          event.currentTarget.src = pooja.image
        }}
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{pooja.title}</h3>
        <p className="mt-2 text-sm text-stone-600 line-clamp-2">{pooja.description}</p>
        <p className="mt-3 text-orange-700 font-semibold">Starting ₹{pooja.startPrice}</p>
        <Link
          to={`/services/${pooja._id}${cityQuery}`}
          className="inline-block mt-3 px-4 py-2 text-sm rounded-lg bg-stone-900 text-white"
        >
          View Details
        </Link>
      </div>
    </article>
  )
}

export default PoojaCard
