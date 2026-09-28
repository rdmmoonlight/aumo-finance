// server/api/v1/journal-entries/index.get.ts
import { prisma } from '~/server/utils/prisma'
import { getUserId } from '~/server/utils/auth' // sesuaikan helper auth kamu

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)

  return await prisma.journalEntries.findMany({
    where: { UserId: userId },
    include: {
      JournalEntryLines: {
        include: {
          ChartOfAccounts: {
            select: {
              ReferenceNumber: true,
              AccountName: true,
            },
          },
        },
        orderBy: { LineOrder: 'asc' },
      },
      EconomicDocuments: {
        select: { Id: true, Title: true, FileName: true },
      },
    },
    orderBy: { EntryDate: 'desc' },
  })
})
