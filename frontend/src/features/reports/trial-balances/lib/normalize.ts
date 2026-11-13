import type { TrialRow } from './types'

type RawTrialRow = Record<string, unknown> & {
  netBalance?: number
  amount?: number
  debit?: number
  credit?: number
  normalBalanceIsDebit?: boolean
}

export function normalizeTrialRows(raw: RawTrialRow[]): TrialRow[] {
  return raw.map((r) => {
    const net = r.netBalance ?? r.amount ?? 0
    let debit = r.debit ?? 0
    let credit = r.credit ?? 0

    if (r.debit === undefined && r.credit === undefined) {
      if (r.normalBalanceIsDebit) {
        debit = net >= 0 ? net : 0
        credit = net < 0 ? Math.abs(net) : 0
      } else {
        credit = net >= 0 ? net : 0
        debit = net < 0 ? Math.abs(net) : 0
      }
    }
    return { ...r, debit, credit } as TrialRow
  })
}
