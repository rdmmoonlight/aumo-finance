export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  await prisma.$transaction([
    prisma.periods.updateMany({ where: { UserId: userId }, data: { IsSelected: false } }),
    prisma.periods.update({ where: { Id: id }, data: { IsSelected: true } })
  ])
  return { success: true }
})
