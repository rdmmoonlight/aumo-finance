export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  await prisma.periods.updateMany({ where: { Id: id, UserId: userId }, data: { IsClosed: true, IsSelected: false } })
  return { success: true }
})
