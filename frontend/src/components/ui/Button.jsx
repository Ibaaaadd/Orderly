import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

/**
 * Button component
 *
 * Variants: primary | secondary | ghost | danger | outline
 * Sizes:    sm | md | lg
 */
const variantStyles = {
  primary:   'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-soft hover:shadow-glow',
  secondary: 'bg-surface-100 hover:bg-surface-200 active:bg-surface-300 text-zinc-700',
  ghost:     'bg-transparent hover:bg-surface-100 active:bg-surface-200 text-zinc-600',
  danger:    'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
  outline:   'bg-transparent border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
}

const sizeStyles = {
  sm: 'h-8  px-3  text-xs  gap-1.5',
  md: 'h-10 px-4  text-sm  gap-2',
  lg: 'h-12 px-6  text-base gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  icon,
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center',
        'font-semibold rounded-xl transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}
