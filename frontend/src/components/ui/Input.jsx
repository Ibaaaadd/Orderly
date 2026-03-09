import React, { forwardRef } from 'react'

/**
 * Input component
 *
 * Props:
 *  label        – string
 *  error        – string (validation error)
 *  helperText   – string
 *  leftIcon     – ReactNode
 *  rightIcon    – ReactNode
 *  fullWidth    – boolean
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`

  return (
    <div className={['flex flex-col gap-1', fullWidth ? 'w-full' : ''].join(' ')}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-700"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-zinc-400">{leftIcon}</span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-800',
            'placeholder:text-zinc-400',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400',
            error
              ? 'border-red-400 focus:ring-red-300'
              : 'border-surface-200 hover:border-surface-300',
            leftIcon  ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            className,
          ].join(' ')}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 text-zinc-400">{rightIcon}</span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-zinc-400 mt-0.5">{helperText}</p>
      )}
    </div>
  )
})

export default Input
