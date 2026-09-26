export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  await prisma.periods.updateMany({ where: { UserId: userId }, data: { IsSelected: false } })
  return { success: true }
})
