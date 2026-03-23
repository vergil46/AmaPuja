function WhatsAppButton() {
  return (
    <>
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 border-t border-orange-200/80 bg-white/95 backdrop-blur px-3 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <a
            href="tel:+919739362962"
            className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800"
          >
            Call Now
          </a>
          <a
            href="https://wa.me/919739362962"
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-xl bg-green-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </>
  )
}

export default WhatsAppButton

