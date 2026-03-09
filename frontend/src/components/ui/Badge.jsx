import React from 'react'

/**
 * Badge component – small colored label.
 *
 * Variants: default | primary | success | warning | danger | info
 */
const variants = {
  default: 'bg-surface-200 text-zinc-600',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-600',
  info:    'bg-blue-100 text-blue-700',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center',
        'px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant] || variants.default,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
