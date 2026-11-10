export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'

export interface Account {
  id: string
  code: string
  name: string
  type: AccountType
  parentId?: string | null
  balance: number
  description?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateAccountPayload {
  code: string
  name: string
  type: AccountType
  parentId?: string | null
  description?: string
}

export interface UpdateAccountPayload {
  code?: string
  name?: string
  type?: AccountType
  parentId?: string | null
  description?: string
  isActive?: boolean
}
