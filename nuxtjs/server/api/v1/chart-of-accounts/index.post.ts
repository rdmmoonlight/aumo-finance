export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validasi Input
  if (!body?.accountName || !String(body.accountName).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Account name is required.' })
  }

  if (!body?.type || !String(body.type).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Account category type is required.' })
  }

  // Validasi Rentang Kode Akun (Sesuai helper C#)
  // if (!AccountClassification.validateReferenceNumber(body.type, body.referenceNumber)) {
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: `Invalid reference number ${body.referenceNumber} for category ${body.type}.`
  //   })
  // }

  // Cek duplikasi nomor referensi
  // const isCodeTaken = await db.chartOfAccounts.exists({ referenceNumber: body.referenceNumber, userId })
  // if (isCodeTaken) {
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: `Account code ${body.referenceNumber} is already in use.`
  //   })
  // }

  try {
    // Simpan ke DB
    // const newAccount = await db.chartOfAccounts.create({ ... })

    return {
      success: true,
      message: `Account '${body.accountName.trim()}' successfully created.`,
      accountId: Date.now()
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `A fatal error occurred while saving the account: ${error.message}`
    })
  }
})
