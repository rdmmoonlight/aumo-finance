export default defineEventHandler(async (event) => {
  const userId = await getAuthUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID.' })
  }

  const body = await readBody(event)

  const account = await prisma.chartOfAccounts.findFirst({
    where: { Id: id, UserId: userId }
  })

  if (!account) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found.' })
  }

  if (!body?.accountName || !String(body.accountName).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Account name is required.' })
  }

  const refNumber = Number(body.referenceNumber)

  const isCodeTaken = await prisma.chartOfAccounts.findFirst({
    where: {
      UserId: userId,
      ReferenceNumber: refNumber,
      NOT: { Id: id }
    }
  })

  if (isCodeTaken) {
    throw createError({
      statusCode: 400,
      statusMessage: `Account code ${refNumber} is already in use.`
    })
  }

  try {
    const updated = await prisma.chartOfAccounts.update({
      where: { Id: id },
      data: {
        ReferenceNumber: refNumber,
        AccountName: String(body.accountName).trim(),
        Type: String(body.type),
        Role: body.role ? String(body.role).trim() : 'Default',
        IsActive: typeof body.isActive === 'boolean' ? body.isActive : true
      }
    })

    return {
      success: true,
      message: `Account '${updated.AccountName}' successfully updated.`
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Fatal error updating account: ${error.message}`
    })
  }
})
