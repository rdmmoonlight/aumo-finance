// server/api/v1/journal-entries/index.post.ts
import { prisma } from '~/server/utils/prisma'
import { getUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const body = await readBody(event)

  const { journalType, entryDate, transactionNumber, lines } = body

  // 1. Validasi Transaksi Terdiri dari minimal 2 baris
  if (!lines || lines.length < 2) {
    throw createError({ statusCode: 400, message: 'Jurnal minimal harus memiliki 2 rincian akun (Debit & Kredit).' })
  }

  // 2. Validasi Balance Debit == Kredit
  const totalDebit = lines.reduce((acc: number, item: any) => acc + Number(item.debit || 0), 0)
  const totalCredit = lines.reduce((acc: number, item: any) => acc + Number(item.credit || 0), 0)

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw createError({ statusCode: 400, message: 'Total Debit dan Kredit tidak seimbang (Unbalanced)!' })
  }

  // 3. Simpan Header + Lines dalam Transaction
  return await prisma.$transaction(async (tx) => {
    const entry = await tx.journalEntries.create({
      data: {
        UserId: userId,
        JournalType: journalType || 'General',
        EntryDate: new Date(entryDate),
        TransactionNumber: transactionNumber,
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
      include: {
        JournalEntryLines: true,
      },
    })
    return entry
  })
})
