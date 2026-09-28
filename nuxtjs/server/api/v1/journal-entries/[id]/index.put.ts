export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const { journalType, entryDate, transactionNumber, lines } = body

  // Validasi Balance
  const totalDebit = lines.reduce((acc: number, item: any) => acc + Number(item.debit || 0), 0)
  const totalCredit = lines.reduce((acc: number, item: any) => acc + Number(item.credit || 0), 0)

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw createError({ statusCode: 400, message: 'Total Debit dan Kredit tidak seimbang!' })
  }

  return await prisma.$transaction(async (tx) => {
    // Hapuskan detail lama
    await tx.journalEntryLines.deleteMany({
      where: { JournalEntryId: id },
    })

    // Update Header dan buat Detail baru
    return await tx.journalEntries.update({
      where: { Id: id, UserId: userId },
      data: {
        JournalType: journalType,
        EntryDate: new Date(entryDate),
        TransactionNumber: transactionNumber,
        UpdatedAt: new Date(),
        JournalEntryLines: {
          create: lines.map((line: any, index: number) => ({
            AccountId: Number(line.accountId),
            LineDescription: line.lineDescription || null,
            Debit: line.debit || 0,
            Credit: line.credit || 0,
            LineOrder: index + 1,
          })),
        },
      },
    })
  })
})
