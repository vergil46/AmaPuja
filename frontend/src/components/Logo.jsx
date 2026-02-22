function Logo({ className = '', variant = 'default' }) {
  const sizes = {
    small: 'h-8',
    default: 'h-10',
    large: 'h-12'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        className={sizes[variant]} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Diya/Lamp Base */}
        <path
          d="M24 38C30 38 35 34 35 29L32 18H16L13 29C13 34 18 38 24 38Z"
          fill="#D97706"
        />
        {/* Diya Inner Glow */}
        <path
          d="M24 35C28 35 31 32 31 28L29 20H19L17 28C17 32 20 35 24 35Z"
          fill="#F59E0B"
        />
        {/* Flame */}
        <path
          d="M24 8C24 8 20 12 20 16C20 19 21.8 21 24 21C26.2 21 28 19 28 16C28 12 24 8 24 8Z"
          fill="#EF4444"
        />
        {/* Flame Inner Light */}
        <path
          d="M24 11C24 11 22 13.5 22 15.5C22 17 22.9 18 24 18C25.1 18 26 17 26 15.5C26 13.5 24 11 24 11Z"
          fill="#FCD34D"
        />
        {/* Om Symbol (Stylized) */}
        <path
          d="M24 40C25.5 40 26.5 40.5 27 41.5C25.5 42.5 22.5 42.5 21 41.5C21.5 40.5 22.5 40 24 40Z"
          fill="#78350F"
        />
        {/* Decorative Dots */}
        <circle cx="18" cy="24" r="1.5" fill="#FCD34D" opacity="0.8" />
        <circle cx="30" cy="24" r="1.5" fill="#FCD34D" opacity="0.8" />
        <circle cx="21" cy="30" r="1" fill="#FBBF24" opacity="0.6" />
        <circle cx="27" cy="30" r="1" fill="#FBBF24" opacity="0.6" />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-orange-800 tracking-tight" style={{ fontSize: variant === 'small' ? '1rem' : variant === 'large' ? '1.5rem' : '1.25rem' }}>
          Ama Puja
        </span>
        {variant !== 'small' && (
          <span className="text-xs text-orange-600 -mt-0.5">Sacred Rituals</span>
        )}
      </div>
    </div>
  )
}

export default Logo
