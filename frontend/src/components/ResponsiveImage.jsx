/**
 * ResponsiveImage Component
 * 
 * Automatically serves WebP format with fallbacks for better compression
 * Implements lazy loading and responsive sizing
 * 
 * Usage:
 * <ResponsiveImage 
 *   src="/image.webp"
 *   fallback="/image.jpg"
 *   alt="Description"
 *   sizes="(max-width: 640px) 100vw, 50vw"
 * />
 */

export function ResponsiveImage({
  src,
  fallback,
  alt = '',
  className = '',
  loading = 'lazy',
  decoding = 'async',
  fetchpriority = 'low',
  sizes = '(max-width: 640px) 100vw, 50vw',
  width,
  height,
  ...props
}) {
  // Determine fallback automatically if not provided
  const getFallback = () => {
    if (fallback) return fallback
    if (src.endsWith('.webp')) {
      return src.replace('.webp', '.jpg')
    }
    return src
  }

  const fallbackSrc = getFallback()
  const isWebp = src.endsWith('.webp')

  return (
    <picture>
      {/* Serve WebP to modern browsers */}
      {isWebp && (
        <source 
          srcSet={src} 
          type="image/webp"
          sizes={sizes}
        />
      )}
      
      {/* Fallback for older browsers */}
      <img
        src={isWebp ? fallbackSrc : src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchpriority}
        sizes={sizes}
        className={className}
        width={width}
        height={height}
        {...props}
      />
    </picture>
  )
}

/**
 * OptimizedGalleryImage Component
 * 
 * Specifically optimized for gallery/proof images
 * Auto-converts paths and includes LCP optimization
 */
export function OptimizedGalleryImage({
  src,
  alt = '',
  priority = false,
  className = 'aspect-square w-full object-cover',
}) {
  return (
    <ResponsiveImage
      src={src.replace(/\.(jpg|jpeg|png)$/i, '.webp')}
      fallback={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : 'low'}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={className}
    />
  )
}

export default ResponsiveImage;
