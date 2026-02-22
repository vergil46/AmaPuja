function PoojaCardSkeleton() {
  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden animate-pulse">
      <div className="bg-stone-200 h-48 w-full"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-stone-200 rounded w-3/4"></div>
        <div className="h-4 bg-stone-200 rounded w-full"></div>
        <div className="h-4 bg-stone-200 rounded w-5/6"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 bg-stone-200 rounded w-24"></div>
          <div className="h-10 bg-stone-200 rounded w-28"></div>
        </div>
      </div>
    </div>
  )
}

function PoojaDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Skeleton */}
        <div className="bg-stone-200 rounded-lg h-96"></div>
        
        {/* Details Skeleton */}
        <div className="space-y-6">
          <div className="h-8 bg-stone-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-stone-200 rounded w-full"></div>
            <div className="h-4 bg-stone-200 rounded w-full"></div>
            <div className="h-4 bg-stone-200 rounded w-2/3"></div>
          </div>
          
          {/* Packages Skeleton */}
          <div className="space-y-4">
            <div className="h-6 bg-stone-200 rounded w-32"></div>
            <div className="space-y-3">
              <div className="border border-stone-200 rounded-lg p-4 space-y-2">
                <div className="h-5 bg-stone-200 rounded w-40"></div>
                <div className="h-4 bg-stone-200 rounded w-24"></div>
              </div>
              <div className="border border-stone-200 rounded-lg p-4 space-y-2">
                <div className="h-5 bg-stone-200 rounded w-40"></div>
                <div className="h-4 bg-stone-200 rounded w-24"></div>
              </div>
            </div>
          </div>
          
          {/* Booking Form Skeleton */}
          <div className="space-y-4 bg-stone-50 p-6 rounded-lg">
            <div className="h-10 bg-stone-200 rounded"></div>
            <div className="h-10 bg-stone-200 rounded"></div>
            <div className="h-10 bg-stone-200 rounded"></div>
            <div className="h-12 bg-stone-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6 animate-pulse">
      <div className="h-8 bg-stone-200 rounded w-48"></div>
      
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-stone-200 rounded-lg p-6 space-y-4">
          <div className="flex justify-between">
            <div className="h-6 bg-stone-200 rounded w-48"></div>
            <div className="h-6 bg-stone-200 rounded w-24"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-stone-200 rounded"></div>
            <div className="h-4 bg-stone-200 rounded"></div>
          </div>
          <div className="h-10 bg-stone-200 rounded w-32"></div>
        </div>
      ))}
    </div>
  )
}

export { PoojaCardSkeleton, PoojaDetailSkeleton, DashboardSkeleton }
