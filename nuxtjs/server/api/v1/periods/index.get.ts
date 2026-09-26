export default defineEventHandler(async (event) => {
  const userId = await getUserId(event) // auto-import dari server/utils/auth.ts
  return await prisma.periods.findMany({
    where: { UserId: userId },
    orderBy: { StartDate: 'desc' }
  })
})
