const proofImageModules = import.meta.glob('../../public/proofs/*.{jpg,jpeg,png,webp,avif,gif}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const proofVideoModules = import.meta.glob('../../public/proofs/**/*.{mp4,webm,ogg,mov,m4v}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const autoDetectedProofImages = Object.values(proofImageModules).sort((firstImage, secondImage) =>
  firstImage.localeCompare(secondImage, undefined, { numeric: true })
)

const autoDetectedProofVideos = Object.values(proofVideoModules).sort((firstVideo, secondVideo) =>
  secondVideo.localeCompare(firstVideo, undefined, { numeric: true })
)

const fallbackProofImages = [
  '/proofs/work1.jpeg',
  '/proofs/work2.jpeg',
  '/proofs/work3.jpeg',
  '/proofs/work4.jpeg',
  '/proofs/work5.jpeg',
  '/proofs/work6.jpeg',
]

const proofImages = autoDetectedProofImages.length > 0 ? autoDetectedProofImages : fallbackProofImages

function WorkProofGallery({
  title = 'Our Work',
  description = 'Real photos and videos from pujas and rituals completed by our team.',
  className = '',
}) {
  return (
    <section className={`max-w-6xl mx-auto px-4 pb-12 sm:pb-16 ${className}`.trim()}>
      <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg sm:text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{description}</p>
      </div>

      {autoDetectedProofVideos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-base sm:text-xl font-semibold text-stone-800">Work Videos</h3>
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4 mt-4">
            {autoDetectedProofVideos.map((video, index) => (
              <article
                key={video}
                className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-md transition-shadow animate-fade-up"
                style={{ animationDelay: `${0.3 + index * 0.08}s` }}
              >
                <video controls preload="metadata" className="h-56 sm:h-64 w-full object-cover bg-black">
                  <source src={video} />
                  Your browser does not support the video tag.
                </video>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-8">
        {proofImages.map((image, index) => (
          <article
            key={image}
            className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-md transition-shadow animate-fade-up"
            style={{ animationDelay: `${0.26 + index * 0.06}s` }}
          >
            <img
              src={image}
              alt={`Ama Puja work proof ${index + 1}`}
              loading="lazy"
              className="h-52 sm:h-52 w-full object-cover"
            />
          </article>
        ))}
      </div>
    </section>
  )
}

export default WorkProofGallery
