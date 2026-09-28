export default defineEventHandler(async (event) => {
  // Ambil data JSON body yang dikirim dari frontend
  const body = await readBody(event)

  // Validasi payload dasar
  if (!body.accountName || !body.referenceNumber || !body.type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Field referenceNumber, accountName, dan type wajib diisi.'
    })
  }

  try {
    // Simpan ke database / kirim ke backend utama
    // const newAccount = await prisma.chartOfAccount.create({ data: body })

    // Response dummy jika berhasil
    return {
      message: 'Account created successfully',
      data: {
        id: Date.now(),
        ...body
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Gagal menambah account baru'
    })
  }
})
