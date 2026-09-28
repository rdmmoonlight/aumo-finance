export default defineEventHandler(async (event) => {
  // Mengambil param 'id' dari folder [id]
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID.' })
  }

  // 1. Cek keberadaan entitas
  // const entity = await db.chartOfAccounts.findFirst({ where: { id, userId } })
  // if (!entity) {
  //   throw createError({ statusCode: 404, statusMessage: 'Account not found.' })
  // }

  // 2. Integritas data: Cek apakah akun memiliki transaksi jurnal
  // const hasJournalLines = await db.journalEntryLines.exists({ accountId: id })
  // if (hasJournalLines) {
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: `Account '${entity.accountName}' cannot be deleted because it already has journal entries. Set it to Inactive instead.`
  //   })
  // }

  try {
    // Hapus dari DB
    // await db.chartOfAccounts.delete({ where: { id } })

    return {
      success: true,
      message: `Account successfully deleted.`
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `A fatal error occurred while deleting the account: ${error.message}`
    })
  }
})
