export default defineEventHandler(async (event) => {
  const userId = await getAuthUserId(event)
  const body = await readBody(event)

  if (!body?.accountName || !String(body.accountName).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Account name is required.' })
  }

  if (!body?.type || !String(body.type).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Account category type is required.' })
  }

  const refNumber = Number(body.referenceNumber)

  const isCodeTaken = await prisma.chartOfAccounts.findUnique({
    where: {
      UserId_ReferenceNumber: {
        UserId: userId,
        ReferenceNumber: refNumber
      }
    }
  })

  if (isCodeTaken) {
    throw createError({
      statusCode: 400,
      statusMessage: `Account code ${refNumber} is already in use.`
    })
  }

  try {
    const newAccount = await prisma.chartOfAccounts.create({
      data: {
        UserId: userId,
        ReferenceNumber: refNumber,
        AccountName: String(body.accountName).trim(),
        Type: String(body.type),
        Role: body.role ? String(body.role).trim() : 'Default',
        IsActive: true
      }
    })

    return {
      success: true,
      message: `Account '${newAccount.AccountName}' successfully created.`,
      accountId: newAccount.Id
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Fatal error saving account: ${error.message}`
    })
  }
})
