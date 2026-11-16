export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const calculateTotals = (lines: Array<{ debit: number; credit: number }>) => {
  return lines.reduce(
    (acc, line) => {
      acc.totalDebit += Number(line.debit) || 0
      acc.totalCredit += Number(line.credit) || 0
      return acc
    },
    { totalDebit: 0, totalCredit: 0 },
  )
}
