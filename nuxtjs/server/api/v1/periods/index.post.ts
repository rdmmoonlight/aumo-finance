import prisma from '~/server/utils/prisma'
import { getUserId } from '~/server/utils/auth'

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"]

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const body = await readBody(event)
  const { month, year } = body // month: 1-12

  if (!month || !year) throw createError({ statusCode: 400, message: 'Month & Year required' })

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59) // akhir bulan
  const periodName = `${MONTH_NAMES[month - 1]} ${year}`

  // cegah duplikat
  const exists = await prisma.periods.findFirst({
    where: { UserId: userId, PeriodName: periodName }
  })
  if (exists) throw createError({ statusCode: 400, message: `Period ${periodName} sudah ada` })

  const period = await prisma.periods.create({
    data: {
      PeriodName: periodName,
      StartDate: startDate,
      EndDate: endDate,
      IsClosed: false,
      IsSelected: false,
      UserId: userId
    }
  })

  return period
})
