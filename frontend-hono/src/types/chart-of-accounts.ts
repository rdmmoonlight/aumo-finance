// src/types/chart-of-accounts.ts

export type CreateAccountRequest = {
    referenceNumber?: number | string;
    accountName?: string;
    type?: string;
    role?: string;
};

export type UpdateAccountRequest = {
    referenceNumber?: number | string;
    accountName?: string;
    type?: string;
    role?: string;
    isActive?: boolean;
};

export type GetChartOfAccountsArg = {
    search?: string;
    category?: string;
};

export type PutChartOfAccountsByIdArg = {
    id: number | string;
    updateAccountRequest: UpdateAccountRequest;
};

export type DeleteChartOfAccountsByIdArg = {
    id: number | string;
};