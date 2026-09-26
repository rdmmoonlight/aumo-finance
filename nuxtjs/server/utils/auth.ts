// server/utils/auth.ts - pakai UserId yang sudah ada di DB
export async function getUserId(event: any) {
  // prisma auto-import dari server/utils/prisma.ts, gak perlu import manual

  // 1. Coba ambil dari Periods yang udah ada isinya
  const existingPeriod = await prisma.periods.findFirst({
    orderBy: { Id: 'desc' },
    select: { UserId: true }
  })

  if (existingPeriod?.UserId) {
    return existingPeriod.UserId
  }

  // 2. Fallback kalo Periods kosong, ambil dari AspNetUsers
  const existingUser = await prisma.aspNetUsers.findFirst({
    select: { Id: true },
    orderBy: { Id: 'asc' }
  })

  if (existingUser?.Id) {
    return existingUser.Id
  }

  throw createError({ statusCode: 404, message: 'Gak ada UserId di DB, Periods & AspNetUsers kosong' })
}
