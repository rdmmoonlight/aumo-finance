import {
  getApiV1ReportsIncomeStatement,
  getApiV1ReportsRetainedEarnings,
  getApiV1ReportsStatementOfCashFlow,
  getApiV1ReportsStatementOfFinancialPosition,
} from '@/lib/generated'

export interface StatementOfFinancialPositionParams {
  isPostClosing?: boolean
}

export async function getIncomeStatementApi(signal?: AbortSignal) {
  const { data } = await getApiV1ReportsIncomeStatement({
    signal,
    throwOnError: true,
  })
  return data as unknown
}

export async function getRetainedEarningsApi(signal?: AbortSignal) {
  const { data } = await getApiV1ReportsRetainedEarnings({
    signal,
    throwOnError: true,
  })
  return data as unknown
}

export async function getStatementOfCashFlowApi(signal?: AbortSignal) {
  const { data } = await getApiV1ReportsStatementOfCashFlow({
    signal,
    throwOnError: true,
  })
  return data as unknown
}

export async function getStatementOfFinancialPositionApi(
  params?: StatementOfFinancialPositionParams,
  signal?: AbortSignal,
) {
  const { data } = await getApiV1ReportsStatementOfFinancialPosition({
    query: { isPostClosing: params?.isPostClosing },
    signal,
    throwOnError: true,
  })
  return data as unknown
}