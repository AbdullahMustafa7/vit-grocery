export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-green-50 animate-pulse">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-3 skeleton rounded-lg w-full" />
        <div className="h-3 skeleton rounded-lg w-2/3" />
        <div className="flex justify-between items-center mt-2">
          <div className="h-6 skeleton rounded-lg w-16" />
          <div className="h-8 skeleton rounded-xl w-16" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 animate-pulse">
      <div className="w-16 h-16 skeleton rounded-2xl" />
      <div className="h-3 skeleton rounded w-14" />
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-green-50 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-4 skeleton rounded w-32" />
        <div className="h-5 skeleton rounded-full w-20" />
      </div>
      <div className="h-3 skeleton rounded w-48" />
      <div className="h-3 skeleton rounded w-24" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 skeleton rounded-lg w-64 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-green-50 space-y-3">
            <div className="h-4 skeleton rounded w-3/4" />
            <div className="h-3 skeleton rounded w-full" />
            <div className="h-3 skeleton rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
