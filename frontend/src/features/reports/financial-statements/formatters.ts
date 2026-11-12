/**
 * Memformat angka menjadi format mata uang IDR (Rupiah).
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'Rp 0'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Memformat persentase.
 */
export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0%'

  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(value / 100)
}
