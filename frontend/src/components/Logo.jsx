function Logo({ className = '', variant = 'default', theme = 'dark' }) {
  const sizes = {
    small: 'h-8',
    default: 'h-10',
    large: 'h-12'
  }

  const isLightTheme = theme === 'light'
  const iconWrapClass = isLightTheme
    ? 'border-amber-300/35 bg-linear-to-br from-amber-500/20 to-orange-500/20 shadow-[0_4px_18px_rgba(217,119,6,0.18)]'
    : 'border-orange-300/55 bg-linear-to-br from-orange-100 to-amber-50 shadow-[0_3px_10px_rgba(194,120,27,0.2)]'
  const iconColorClass = isLightTheme ? 'text-amber-300' : 'text-orange-700'
  const brandClass = isLightTheme ? 'text-amber-100' : 'text-stone-900'
  const taglineClass = isLightTheme ? 'text-amber-200/80' : 'text-stone-600'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex items-center justify-center rounded-xl border p-1.5 ${iconWrapClass}`}
        aria-hidden="true"
      >
      <svg
        className={`${sizes[variant]} ${iconColorClass}`}
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 29C14 34 18.5 37.5 24 37.5C29.5 37.5 34 34 34 29L31.5 20H16.5L14 29Z"
          fill="currentColor"
          opacity="0.28"
        />
        <path
          d="M24 8.5C24 8.5 20.7 12.1 20.7 16.1C20.7 18.8 22.2 20.8 24 20.8C25.8 20.8 27.3 18.8 27.3 16.1C27.3 12.1 24 8.5 24 8.5Z"
          fill="currentColor"
        />
        <path
          d="M16 29H32"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M19 24.5C20.2 23.1 21.9 22.3 24 22.3C26.1 22.3 27.8 23.1 29 24.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="41" r="1.7" fill="currentColor" opacity="0.85" />
      </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={`font-semibold tracking-tight ${brandClass}`}
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            fontSize: variant === 'small' ? '1rem' : variant === 'large' ? '1.5rem' : '1.25rem'
          }}
        >
          Puja Samriddhi
        </span>
        {variant !== 'small' && (
          <span
            className={`-mt-0.5 ${taglineClass}`}
            style={{
              fontFamily: "'Playfair Display', 'Cinzel', serif",
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.04em'
            }}
          >
            Sacred Ritual Services
          </span>
        )}
      </div>
    </div>
  )
}

export default Logo

