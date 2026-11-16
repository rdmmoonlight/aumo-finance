export function getAuthErrorMessage(e: unknown): string {
  if (e instanceof TypeError) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.'
  }
  const err = e as { message?: string; errors?: string[] } | undefined
  const first = err?.errors?.[0]
  if (first) return first
  if (err?.message) return err.message
  return 'Terjadi kesalahan. Silakan coba lagi.'
}
