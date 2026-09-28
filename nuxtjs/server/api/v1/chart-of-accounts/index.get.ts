export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = query.search ? String(query.search).trim().toLowerCase() : null
  const category = query.category ? String(query.category).trim() : null

  // Dapatkan UserId yang valid
  const userId = await getAuthUserId(event)

  try {
    const whereCondition: any = { UserId: userId }

    if (search) {
      whereCondition.OR = [
        { AccountName: { contains: search, mode: 'insensitive' } },
        { ReferenceNumber: !isNaN(Number(search)) ? Number(search) : undefined }
      ].filter(cond => cond.ReferenceNumber !== undefined || cond.AccountName)
    }

    if (category) {
      whereCondition.Type = category
    }

    const loadedAccounts = await prisma.chartOfAccounts.findMany({
      where: whereCondition,
      orderBy: { ReferenceNumber: 'asc' }
    })

    const accountIds = loadedAccounts.map(a => a.Id)

    const currentPeriod = await prisma.periods.findFirst({
      where: { UserId: userId, IsSelected: true }
    })

    let balancesMap: Record<number, { debit: number; credit: number }> = {}

    if (currentPeriod && accountIds.length > 0) {
      const journalLines = await prisma.journalEntryLines.findMany({
        where: {
          AccountId: { in: accountIds },
          JournalEntries: {
            EntryDate: {
              gte: currentPeriod.StartDate,
              lte: currentPeriod.EndDate
            }
          }
        },
        select: {
          AccountId: true,
          Debit: true,
          Credit: true
        }
      })

      for (const line of journalLines) {
        if (!balancesMap[line.AccountId]) {
          balancesMap[line.AccountId] = { debit: 0, credit: 0 }
        }
        balancesMap[line.AccountId].debit += Number(line.Debit)
        balancesMap[line.AccountId].credit += Number(line.Credit)
      }
    }

    const normalDebitTypes = ['Assets', 'OperatingExpenses', 'OtherExpenses']

    const accountsResult = loadedAccounts.map(a => {
      const balanceData = balancesMap[a.Id] || { debit: 0, credit: 0 }
      const isNormalDebit = normalDebitTypes.includes(a.Type)

      const balance = isNormalDebit
        ? balanceData.debit - balanceData.credit
        : balanceData.credit - balanceData.debit

      return {
        id: a.Id,
        referenceNumber: a.ReferenceNumber,
        accountName: a.AccountName,
        type: a.Type,
        role: a.Role,
        isActive: a.IsActive,
        balance: currentPeriod ? balance : 0
      }
    })

    return {
      success: true,
      selectedPeriodName: currentPeriod?.PeriodName || null,
      accounts: accountsResult
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Fatal error loading accounts'
    })
  }
})
