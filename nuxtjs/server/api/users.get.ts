export default defineEventHandler(async (event) => {
  try {
    // 'prisma' di-auto-import secara otomatis dari server/utils/prisma.ts
    const users = await prisma.aspNetUsers.findMany({
      select: {
        Id: true,
        FullName: true,
        Email: true,
      },
      take: 10,
    })

    return { success: true, data: users }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})