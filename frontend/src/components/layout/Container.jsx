import React from 'react'

/**
 * Container – centered content wrapper with consistent padding.
 */
export default function Container({ children, className = '' }) {
  return (
    <main className={['max-w-2xl mx-auto px-4 pb-24', className].join(' ')}>
      {children}
    </main>
  )
}
