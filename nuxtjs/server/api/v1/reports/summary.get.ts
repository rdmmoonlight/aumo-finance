export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)

  // Query paralel untuk efisiensi performa database
  const [journalCount, activeCoaCount, activePeriod] = await Promise.all([
    // 1. Total Transaksi Jurnal Umum
    prisma.journalEntries.count({
      where: { UserId: userId }
    }),

    // 2. Total Chart of Accounts yang Aktif
    prisma.chartOfAccounts.count({
      where: { 
        UserId: userId,
        IsActive: true
      }
    }),

    // 3. Periode Akuntansi Berjalan (IsSelected / IsClosed = false)
    prisma.periods.findFirst({
      where: {
        UserId: userId,
        IsClosed: false,
        IsSelected: true
      },
      select: {
        PeriodName: true,
        IsClosed: true
      }
    })
  ])

  return {
    totalJournal: journalCount,
    activeCoa: activeCoaCount,
    activePeriodName: activePeriod?.PeriodName || 'Tidak Ada Periode Aktif',
    isPeriodOpen: activePeriod ? !activePeriod.IsClosed : false
  }
})
