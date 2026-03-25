function WhatsAppButton() {
  return (
    <>
      <style>{`@keyframes whatsappGlow { 0%, 100% { box-shadow: 0 16px 32px rgba(22,163,74,0.30); transform: translateY(0); } 50% { box-shadow: 0 20px 38px rgba(22,163,74,0.48); transform: translateY(-1px); } }`}</style>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        <a
          href="tel:+919739362962"
          className="inline-flex items-center rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-[#7b3b16] shadow-[0_10px_26px_rgba(123,59,22,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(123,59,22,0.28)]"
        >
          Call Pandit Instantly
        </a>
        <a
          href="https://wa.me/919739362962"
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-[88vw] items-center justify-center rounded-2xl border border-green-500 bg-linear-to-r from-green-600 to-green-500 px-5 py-3 text-center text-sm font-bold text-white shadow-[0_16px_32px_rgba(22,163,74,0.35)] transition hover:-translate-y-0.5 hover:brightness-105 sm:max-w-none sm:px-6 sm:text-base"
          style={{ animation: 'whatsappGlow 2.8s ease-in-out infinite' }}
          aria-label="Book Pandit on WhatsApp (Instant Response)"
        >
          Book Pandit on WhatsApp (Instant Response)
        </a>
      </div>
    </>
  )
}

export default WhatsAppButton

