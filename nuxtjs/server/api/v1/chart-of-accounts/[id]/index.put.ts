export default defineEventHandler(async (event) => {
  // Mengambil param 'id' dari folder [id]
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID.' })
  }

  const body = await readBody(event)

  // 1. Cek apakah entitas ada
  // const account = await db.chartOfAccounts.findFirst({ where: { id, userId } })
  // if (!account) {
  //   throw createError({ statusCode: 404, statusMessage: 'Account not found.' })
  // }

  // 2. Validasi Input
  if (!body?.accountName || !String(body.accountName).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Account name is required.' })
  }

  // 3. Cek Duplikasi Kode Akun pada ID Lain
  // const isCodeTaken = await db.chartOfAccounts.exists({ referenceNumber: body.referenceNumber, userId, idNotEqual: id })
  // if (isCodeTaken) {
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: `Account code ${body.referenceNumber} is already in use.`
  //   })
  // }

  try {
    // Update data di DB
    // await db.chartOfAccounts.update({ where: { id }, data: { ... } })

    return {
      success: true,
      message: `Account '${body.accountName.trim()}' successfully updated.`
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `A fatal error occurred while updating the account: ${error.message}`
    })
  }
})
