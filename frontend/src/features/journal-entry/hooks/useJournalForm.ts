import { computed, ref } from 'vue'
import { calculateTotals } from '../helpers'

type JournalLine = {
  accountId: string
  debit: number
  credit: number
  memo: string
}

export function useJournalForm(initialLines: JournalLine[] = []) {
  const transactionDate = ref<string>(new Date().toISOString().split('T')[0])
  const referenceNumber = ref<string>('')
  const description = ref<string>('')
  const lines = ref<JournalLine[]>(
    initialLines.length > 0
      ? initialLines
      : [
          { accountId: '', debit: 0, credit: 0, memo: '' },
          { accountId: '', debit: 0, credit: 0, memo: '' },
        ],
  )

  const totals = computed(() => calculateTotals(lines.value))
  const totalDebit = computed(() => totals.value.totalDebit)
  const totalCredit = computed(() => totals.value.totalCredit)
  const isBalanced = computed(() => totalDebit.value > 0 && totalDebit.value === totalCredit.value)

  const addLine = () => {
    lines.value.push({ accountId: '', debit: 0, credit: 0, memo: '' })
  }

  const removeLine = (index: number) => {
    if (lines.value.length > 2) {
      lines.value.splice(index, 1)
    }
  }

  const updateLine = <K extends keyof JournalLine>(
    index: number,
    field: K,
    value: JournalLine[K],
  ) => {
    if (lines.value[index]) {
      lines.value[index] = {
        ...lines.value[index],
        [field]: value,
      }
    }
  }

  const resetForm = () => {
    transactionDate.value = new Date().toISOString().split('T')[0]
    referenceNumber.value = ''
    description.value = ''
    lines.value = [
      { accountId: '', debit: 0, credit: 0, memo: '' },
      { accountId: '', debit: 0, credit: 0, memo: '' },
    ]
  }

  return {
    transactionDate,
    referenceNumber,
    description,
    lines,
    totalDebit,
    totalCredit,
    isBalanced,
    addLine,
    removeLine,
    updateLine,
    resetForm,
  }
}
