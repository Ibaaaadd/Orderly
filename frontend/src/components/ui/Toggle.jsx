import React from 'react'

/**
 * Toggle — sliding switch component.
 *
 * Props:
 *  checked   – boolean controlled value
 *  onChange  – (newChecked: boolean) => void
 *  label     – optional label text shown beside the switch
 *  labelLeft – render label on the left (default: right)
 *  disabled  – disable interaction
 *  size      – 'sm' | 'md' (default: 'md')
 */
export default function Toggle({
  checked = false,
  onChange,
  label,
  labelLeft = false,
  disabled = false,
  size = 'md',
}) {
  const sizes = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'h-3.5 w-3.5',
      on:    'translate-x-[18px]',
      off:   'translate-x-0.5',
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-4 w-4',
      on:    'translate-x-[22px]',
      off:   'translate-x-1',
    },
  }
  const s = sizes[size] || sizes.md

  const track = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={[
        'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
        s.track,
        checked ? 'bg-primary-600' : 'bg-surface-300',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block rounded-full bg-white shadow-sm transition-transform duration-200',
          s.thumb,
          checked ? s.on : s.off,
        ].join(' ')}
      />
    </button>
  )

  if (!label) return track

  return (
    <label
      className={[
        'inline-flex items-center gap-2.5',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
      onClick={() => !disabled && onChange?.(!checked)}
    >
      {labelLeft && (
        <span className="select-none text-sm font-medium text-zinc-700">{label}</span>
      )}
      {track}
      {!labelLeft && (
        <span className="select-none text-sm font-medium text-zinc-700">{label}</span>
      )}
    </label>
  )
}
