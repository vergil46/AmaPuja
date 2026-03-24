const proofVideos = []

const proofImages = [
  '/proofs/p.jpeg',
  '/proofs/work1.jpeg',
  '/proofs/work2.jpeg',
  '/proofs/work3.jpeg',
  '/proofs/work4.jpeg',
  '/proofs/work5.jpeg',
  '/proofs/work6.jpeg',
  '/proofs/work7.jpeg',
  '/proofs/work8.jpeg',
]

import { OptimizedGalleryImage } from './ResponsiveImage'

function WorkProofGallery({
  title = 'Our Work',
  description = 'Real photos and videos from pujas and rituals completed by our team.',
  className = '',
}) {
  return (
    <section className={`mx-auto max-w-6xl px-4 pb-12 sm:pb-16 ${className}`.trim()}>
      <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-semibold text-stone-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 text-base leading-relaxed text-stone-600">{description}</p>
      </div>

      {proofVideos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-stone-800 sm:text-2xl">Work Videos</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {proofVideos.map((video, index) => (
              <article
                key={video}
                className="animate-fade-up overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                style={{ animationDelay: `${0.3 + index * 0.08}s` }}
              >
                <video controls preload="none" className="h-60 w-full object-cover bg-black sm:h-72">
                  <source src={video} />
                  Your browser does not support the video tag.
                </video>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-stone-800 sm:text-2xl">Work Photos</h3>
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5">
        {proofImages.map((image, index) => (
          <article
            key={image}
            className="animate-fade-up self-start overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            style={{ animationDelay: `${0.26 + index * 0.06}s` }}
          >
            <OptimizedGalleryImage 
              src={image}
              alt={`Puja Samriddhi work proof ${index + 1}`}
              priority={index < 2}
              className="block aspect-square w-full max-h-150 object-cover"
            />
          </article>
        ))}
      </div>
    </section>
  )
}

export default WorkProofGallery

