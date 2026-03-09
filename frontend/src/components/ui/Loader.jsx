import React from 'react'

/**
 * Loader / Skeleton components
 *
 * Exports:
 *  Spinner         – circular spinner
 *  SkeletonBox     – rectangle skeleton
 *  MenuCardSkeleton – skeleton placeholder matching MenuCard layout
 *  PageLoader      – full-page centered spinner
 */

export function Spinner({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={['animate-spin text-primary-500', className].join(' ')}
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export function SkeletonBox({ className = '' }) {
  return (
    <div
      className={['skeleton', className].join(' ')}
      aria-hidden="true"
    />
  )
}

export function MenuCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-surface-100">
      {/* Image area */}
      <SkeletonBox className="h-44 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <SkeletonBox className="h-5 w-20" />
          <SkeletonBox className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={40} />
        <p className="text-sm text-zinc-500 font-medium">Memuat...</p>
      </div>
    </div>
  )
}

export default Spinner
