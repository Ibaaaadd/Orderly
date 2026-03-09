/**
 * Format a number as Indonesian Rupiah.
 * e.g.  15000 → "Rp 15.000"
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('id-ID', {
    style:    'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Compact format for large numbers.
 * e.g.  150000 → "Rp 150rb"
 */
export function formatPriceCompact(amount) {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`
  }
  return formatPrice(amount)
}
