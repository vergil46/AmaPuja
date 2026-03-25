function WhatsAppButton() {
  return (
    <>
      <style>{`@keyframes whatsappGlow { 0%, 100% { box-shadow: 0 16px 32px rgba(22,163,74,0.30); transform: translateY(0); } 50% { box-shadow: 0 20px 38px rgba(22,163,74,0.48); transform: translateY(-1px); } }`}</style>
      <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
        <a
          href="https://wa.me/919739362962"
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-[78vw] items-center justify-center rounded-xl border border-green-500 bg-linear-to-r from-green-600 to-green-500 px-3.5 py-2 text-center text-[11px] font-bold text-white shadow-[0_14px_28px_rgba(22,163,74,0.32)] transition hover:-translate-y-0.5 hover:brightness-105 sm:max-w-none sm:px-5 sm:py-2.5 sm:text-sm"
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

