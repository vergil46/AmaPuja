import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Seo from '../components/Seo'

const categories = [
  'All',
  'Ganesh Puja',
  'Durga Puja',
  'Satyanarayan Puja',
  'Navagraha Puja',
  'Shiva Puja',
  'Griha Pravesh',
  'Annaprashan',
  'Other Pujas',
]

const trustPoints = [
  'Experienced Pandits',
  'Transparent Pricing',
  'No Hidden Charges',
  'Complete Puja Support',
]

function PujaGalleryPage() {
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await api.get('/gallery')
        setGalleryItems(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Failed to load gallery items:', error)
        setGalleryItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryItems()
  }, [])

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return galleryItems
    return galleryItems.filter((item) => item.category === selectedCategory)
  }, [galleryItems, selectedCategory])

  const openLightbox = (index) => {
    setSelectedImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const moveLightbox = (direction) => {
    setSelectedImageIndex((currentIndex) => {
      const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
      if (nextIndex < 0) return filteredItems.length - 1
      if (nextIndex >= filteredItems.length) return 0
      return nextIndex
    })
  }

  useEffect(() => {
    if (!lightboxOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowRight') moveLightbox('next')
      if (event.key === 'ArrowLeft') moveLightbox('prev')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, filteredItems.length])

  const activeImage = filteredItems[selectedImageIndex] || filteredItems[0]

  return (
    <>
      <Seo
        title="Puja Gallery | Puja Samriddhi"
        description="Explore real photos from completed pujas, rituals, and family ceremonies performed by Puja Samriddhi."
      />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:pt-12 sm:pb-16">
        <div className="animate-fade-up text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6F00]">Puja Samriddhi</p>
          <h1 className="mt-3 text-3xl font-bold text-[#333333] sm:text-4xl lg:text-5xl">Puja Gallery</h1>
          <p className="mt-3 text-base text-stone-600 sm:text-lg">Real moments from our successfully completed pujas 🙏</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2.5">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                selectedCategory === category
                  ? 'border-[#D84315] bg-[#FFF3E8] text-[#A94918] shadow-sm'
                  : 'border-[#F3D9B7] bg-white text-stone-700 hover:border-[#FFB066] hover:text-[#A94918]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-[#F2E1C8] bg-white shadow-sm">
                <div className="h-72 w-full bg-stone-200" />
                <div className="p-4">
                  <div className="h-4 w-20 rounded bg-stone-200" />
                  <div className="mt-3 h-6 w-2/3 rounded bg-stone-200" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-stone-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => (
              <article
                key={item._id || item.id}
                className="group animate-fade-up overflow-hidden rounded-2xl border border-[#F2E1C8] bg-white shadow-[0_12px_30px_rgba(97,55,22,0.08)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(97,55,22,0.14)]"
                style={{ animationDelay: `${0.08 + index * 0.05}s` }}
              >
                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="block w-full text-left"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={`${item.title} in ${item.location}`}
                      loading="lazy"
                      decoding="async"
                      className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f140d]/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>

                <div className="p-4">
                  <div className="mb-2 inline-flex rounded-full bg-[#FFF8E1] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A94918]">
                    {item.category}
                  </div>
                  <h2 className="text-lg font-semibold text-[#333333]">{item.title}</h2>

                  <div className="mt-3 space-y-1 text-sm text-stone-600">
                    <p><span className="font-medium text-stone-700">Location:</span> {item.location}</p>
                    <p><span className="font-medium text-stone-700">Date:</span> {item.date}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#F2D2A4] bg-[#FFF8E1] p-6 text-center text-stone-600">
            No puja photos found in this category yet.
          </div>
        )}
      </section>

      <section className="border-t border-[#F5E5C7] bg-[#FFF8E1]/60 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6F00]">Why families trust us</p>
            <h2 className="mt-3 text-2xl font-bold text-[#333333] sm:text-3xl">Real rituals, honest service, and smooth support</h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point) => (
              <div key={point} className="rounded-2xl border border-[#F2E1C8] bg-white px-5 py-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF3E8] text-[#D84315]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 3L19 6V11.5C19 16.1 15.95 20.35 12 21C8.05 20.35 5 16.1 5 11.5V6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.25 12.25L11 14L14.75 10.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="mt-4 text-base font-semibold text-[#333333]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="rounded-[32px] border border-[#F2D7B6] bg-linear-to-br from-[#FFF8E1] to-[#FFF3C4] px-6 py-8 text-center shadow-[0_18px_40px_rgba(97,55,22,0.08)] sm:px-10 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6F00]">Planning a Puja?</p>
          <h3 className="mt-3 text-2xl font-bold text-[#333333] sm:text-3xl">Let us help you create a sacred and memorable ritual.</h3>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/services"
              className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-[#D84315] via-[#FF6F00] to-[#FF8F00] px-6 py-3 text-base font-bold text-white shadow-[0_12px_24px_rgba(216,67,21,0.28)] transition hover:brightness-105"
            >
              Book a Puja
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full border border-[#D6B88E] bg-white px-6 py-3 text-base font-bold text-[#333333] transition hover:bg-[#FFF8E1]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {lightboxOpen && activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17120d]/85 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -right-2 -top-12 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-[#333333] shadow-lg"
              aria-label="Close gallery"
            >
              ×
            </button>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1b140f] shadow-2xl">
              <button
                type="button"
                onClick={() => moveLightbox('prev')}
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-light text-[#333333] shadow-lg transition hover:bg-white"
                aria-label="Previous image"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() => moveLightbox('next')}
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-light text-[#333333] shadow-lg transition hover:bg-white"
                aria-label="Next image"
              >
                ›
              </button>

              <img
                src={activeImage.image}
                alt={`${activeImage.name} in ${activeImage.location}`}
                className="max-h-[80vh] w-full object-contain"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4 text-center text-white backdrop-blur-sm">
              <h3 className="text-xl font-semibold">{activeImage.title}</h3>
              <p className="mt-1 text-sm text-stone-200">
                {activeImage.category} • {activeImage.location} • {activeImage.date}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PujaGalleryPage
