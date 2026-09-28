export default defineEventHandler(async (event) => {
  // Ambil ID dari URL parameter
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID account tidak ditemukan'
    })
  }

  try {
    // Update ke database
    // await prisma.chartOfAccount.update({ where: { id: Number(id) }, data: body })

    return {
      message: `Account #${id} updated successfully`
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Gagal memperbarui account'
    })
  }
})
