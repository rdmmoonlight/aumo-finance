/**
 * Memformat tanggal ISO dari API (UTC) menjadi format Indonesia.
 * Contoh: "2026-11-01T00:00:00Z" -> "1 November 2026".
 * timeZone UTC dipakai agar tanggal tidak bergeser akibat zona waktu perangkat.
 */
export function formatPeriodDate(value: string | null | undefined): string {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
