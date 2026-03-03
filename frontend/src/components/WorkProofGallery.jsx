const proofVideos = [
  '/proofs/Videos/proofvideo.mp4',
  '/proofs/Videos/workvideo2.mp4',
]

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

      {proofVideos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-base sm:text-xl font-semibold text-stone-800">Work Videos</h3>
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4 mt-4">
            {proofVideos.map((video, index) => (
              <article
                key={video}
                className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-md transition-shadow animate-fade-up"
                style={{ animationDelay: `${0.3 + index * 0.08}s` }}
              >
                <video controls preload="none" className="h-56 sm:h-64 w-full object-cover bg-black">
                  <source src={video} />
                  Your browser does not support the video tag.
                </video>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-start gap-3 sm:gap-4 mt-8">
        {proofImages.map((image, index) => (
          <article
            key={image}
            className="self-start overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-md transition-shadow animate-fade-up"
            style={{ animationDelay: `${0.26 + index * 0.06}s` }}
          >
            <img
              src={image}
              alt={`PujaSamrddhi work proof ${index + 1}`}
              loading="lazy"
              decoding="async"
              fetchpriority="low"
              className="block h-52 sm:h-52 w-full object-cover"
            />
          </article>
        ))}
      </div>
    </section>
  )
}

export default WorkProofGallery
