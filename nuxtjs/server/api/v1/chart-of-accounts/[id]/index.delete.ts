import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = event.context.user?.id
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'User identity is invalid or expired.' })
  }

  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID.' })
  }

  // 1. Cek keberadaan Akun
  const entity = await prisma.chartOfAccounts.findFirst({
    where: { Id: id, UserId: userId }
  })

  if (!entity) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found.' })
  }

  // 2. Integritas Data: Cek apakah akun memiliki transaksi jurnal
  const hasJournalLines = await prisma.journalEntryLines.findFirst({
    where: { AccountId: id }
  })

  if (hasJournalLines) {
    throw createError({
      statusCode: 400,
      statusMessage: `Account '${entity.AccountName}' cannot be deleted because it already has journal entries. Set it to Inactive instead.`
    })
  }

  try {
    await prisma.chartOfAccounts.delete({
      where: { Id: id }
    })

    return {
      success: true,
      message: `Account '${entity.AccountName}' successfully deleted.`
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `A fatal error occurred while deleting the account: ${error.message}`
    })
  }
})
