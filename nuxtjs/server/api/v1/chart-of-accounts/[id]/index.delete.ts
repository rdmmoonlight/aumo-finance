export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID.' })
  }

  const entity = await prisma.chartOfAccounts.findFirst({
    where: { Id: id, UserId: userId }
  })

  if (!entity) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found.' })
  }

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
      statusMessage: `Fatal error deleting account: ${error.message}`
    })
  }
})
