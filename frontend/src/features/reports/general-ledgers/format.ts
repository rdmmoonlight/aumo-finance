/**
 * Memformat angka ke format mata uang Rupiah (IDR)
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return 'Rp 0'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Memformat angka mutasi debit/kredit (menampilkan '-' jika bernilai 0)
 */
export function formatMutation(amount: number | undefined | null): string {
  if (!amount || amount === 0) {
    return '-'
  }

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Memformat tanggal ISO string ke format lokal Indonesia (Contoh: 12 Nov 2026)
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
