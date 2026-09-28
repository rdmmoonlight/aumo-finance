export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID account tidak valid'
    })
  }

  try {
    // Hapus dari database
    // await prisma.chartOfAccount.delete({ where: { id: Number(id) } })

    return {
      message: `Account #${id} deleted successfully`
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Gagal menghapus account'
    })
  }
})
