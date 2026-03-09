import React from 'react'
import { formatPrice } from '../../utils/formatPrice.js'
import Button from '../ui/Button.jsx'

/**
 * CartSummary – shows price breakdown and checkout / view-cart button.
 *
 * Props:
 *  total        – number
 *  onCheckout   – async function
 *  loading      – boolean
 *  disabled     – boolean (e.g. when cart empty or no customer name)
 */
export default function CartSummary({ total, onCheckout, loading, disabled }) {
  return (
    <div className="space-y-3">
      {/* Price rows */}
      <div className="flex justify-between text-sm text-zinc-500">
        <span>Subtotal</span>
        <span className="text-zinc-700 font-medium">{formatPrice(total)}</span>
      </div>
      <div className="flex justify-between text-sm text-zinc-500">
        <span>Biaya layanan</span>
        <span className="text-green-600 font-medium">Gratis</span>
      </div>
      <div className="h-px bg-surface-200" />
      <div className="flex justify-between font-bold text-zinc-800">
        <span>Total</span>
        <span className="text-primary-600 text-lg">{formatPrice(total)}</span>
      </div>

      <Button
        fullWidth
        size="lg"
        loading={loading}
        disabled={disabled}
        onClick={onCheckout}
        className="mt-2"
      >
        Bayar Sekarang
      </Button>
    </div>
  )
}
