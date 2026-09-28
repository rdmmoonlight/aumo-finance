export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  // Cascading delete sudah terpasang di schema.prisma
  return await prisma.journalEntries.delete({
    where: {
      Id: id,
      UserId: userId,
    },
  })
})
