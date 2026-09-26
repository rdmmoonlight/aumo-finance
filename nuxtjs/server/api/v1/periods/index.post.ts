const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"]

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const { month, year } = await readBody(event)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)
  const periodName = `${MONTH_NAMES[month-1]} ${year}`

  const exists = await prisma.periods.findFirst({ where: { UserId: userId, PeriodName: periodName } })
  if (exists) throw createError({ statusCode: 400, message: `Period ${periodName} sudah ada` })

  return await prisma.periods.create({
    data: { PeriodName: periodName, StartDate: startDate, EndDate: endDate, IsClosed: false, IsSelected: false, UserId: userId }
  })
})
