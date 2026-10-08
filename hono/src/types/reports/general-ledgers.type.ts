// ledger.types.ts

export type LedgerLineResponse = {
    journalEntryId: number;
    transactionNumber: string;
    entryDate: string; // yyyy-MM-dd
    description: string;
    debit: number;
    credit: number;
    runningBalance: number;
};

export type LedgerAccountResponse = {
    accountId: number;
    referenceNumber: number;
    accountName: string;
    accountType: string;
    type: string; // alias AccountType
    normalBalanceIsDebit: boolean;
    beginningBalance: number;
    endingBalance: number;
    lines: LedgerLineResponse[];
};

export type TemporaryLedgerGroupedResponse = {
    selectedPeriodName: string;
    netIncomeBeforeClosing: number;
    accounts: LedgerAccountResponse[];
};

export type PermanentLedgerGroupedResponse = {
    selectedPeriodName: string;
    accounts: LedgerAccountResponse[];
};

export type PermanentLedgerDto = {
    id: number;
    accountId: number;
    accountName: string;
    accountReferenceNumber: number;
    accountType: string;
    journalEntryId: number;
    journalEntryLineId: number;
    entryDate: string; // ISO, dari DateTime
    transactionNumber: string;
    lineDescription: string;
    debit: number;
    credit: number;
    runningBalance: number;
};

export type TemporaryLedgerDto = PermanentLedgerDto;