export interface ApiError {
  data?: { message?: string };
  message?: string;
}

export interface AccountItem {
  id?: number | string;
  displayLabel?: string;
  referenceNumber?: string;
  accountName?: string;
}

export interface PeriodItem {
  id: number;
  periodName?: string;
  startDate?: string;
  endDate?: string;
  isClosed?: boolean;
  isSelected?: boolean;
}

export interface OpenInfoData {
  hasExistingPermanentAccounts?: boolean;
  availableCashAndBankAccounts?: AccountItem[];
  availableRetainedEarningsAccounts?: AccountItem[];
}
