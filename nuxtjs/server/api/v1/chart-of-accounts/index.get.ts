export default defineEventHandler(async (event) => {
  try {
    // KONEKSI DATABASE / BACKEND UTAMA
    // Jika Nuxt terhubung langsung ke database (misal via Prisma, Drizzle, dll):
    // const accounts = await prisma.chartOfAccount.findMany()

    // Atau jika Nuxt berfungsi sebagai BFF (Backend-for-Frontend) yang memanggil backend eksternal:
    // const config = useRuntimeConfig()
    // const accounts = await $fetch(`${config.apiBaseUrl}/v1/chart-of-accounts`)

    // Contoh Mock Data sederhana:
    const accounts = [
      { id: 1, referenceNumber: 101, accountName: 'Kas Utama', type: 'Assets', role: 'Default', isActive: true },
      { id: 2, referenceNumber: 201, accountName: 'Hutang Usaha', type: 'Liabilities', role: 'Default', isActive: true }
    ]

    return accounts
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Gagal mengambil data Chart of Accounts'
    })
  }
})
