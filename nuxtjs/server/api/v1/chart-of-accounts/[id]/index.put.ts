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

  const body = await readBody(event)

  // 1. Cek keberadaan Akun
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

  // 2. Cek Duplikasi Kode Akun pada ID Lain
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
      statusMessage: `A fatal error occurred while updating the account: ${error.message}`
    })
  }
})
