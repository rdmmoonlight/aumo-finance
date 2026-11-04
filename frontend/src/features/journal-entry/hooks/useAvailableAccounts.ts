import { toast } from "sonner";
import { chartOfAccountsApi } from "../../chart-of-accounts/api/chartOfAccountsApi";
import { AccountOption } from "../utils/helpers";

export function useAvailableAccounts() {
  const query = chartOfAccountsApi.endpoints.getChartOfAccounts.useQuery();

  if (query.error) toast.error("Gagal memuat Chart of Accounts");

  const raw: any = query.data;
  const list = raw?.accounts || raw?.data || (Array.isArray(raw) ? raw : []);

  const accounts: AccountOption[] = list.map((a: any) => ({
    ...a,
    id: Number(a.id),
    referenceNumber: a.referenceNumber ?? "",
    accountName: a.accountName ?? "",
  }));

  return { accounts, isLoading: query.isLoading };
}
