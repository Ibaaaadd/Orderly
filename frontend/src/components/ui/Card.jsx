import React from 'react'
import { motion } from 'framer-motion'

/**
 * Card component – base card container.
 *
 * Props:
 *  hoverable   – adds lift animation on hover
 *  padding     – 'none' | 'sm' | 'md' | 'lg'
 *  className
 */
const paddingMap = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
}

export default function Card({
  children,
  hoverable = false,
  padding = 'md',
  className = '',
  onClick,
  ...props
}) {
  const Component = hoverable ? motion.div : 'div'
  const motionProps = hoverable
    ? { whileHover: { y: -4, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }, transition: { duration: 0.2 } }
    : {}

  return (
    <Component
      className={[
        'bg-white rounded-2xl shadow-soft border border-surface-100',
        paddingMap[padding] || paddingMap.md,
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
}
