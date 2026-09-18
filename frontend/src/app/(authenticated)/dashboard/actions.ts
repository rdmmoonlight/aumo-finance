"use server";

export interface AccountBalanceItem {
  accountId: number;
  referenceNumber: string;
  accountName: string;
  balance: number;
}

export interface TrendItem {
  label: string;
  revenue: number;
  expense: number;
  net: number;
}

export interface DashboardViewModel {
  hasPeriodSelected: boolean;
  selectedPeriodName?: string;
  isPeriodClosed: boolean;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  cashAccounts: AccountBalanceItem[];
  totalCashOnHand: number;
  bankAccounts: AccountBalanceItem[];
  totalBankBalance: number;
  expenseAccountsList?: AccountBalanceItem[];
  chartTrend: TrendItem[];
  recentEntries: any[];
}

export async function getDashboardData(
  periodType: string = "monthly"
): Promise<{ data: DashboardViewModel | null; error: string | null }> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    
    // Ganti endpoint dan header auth sesuai kebutuhan API backend
    const res = await fetch(`${apiBaseUrl}/api/v1/dashboard?period=${periodType}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return { data: null, error: `Failed to fetch data: ${res.statusText}` };
    }

    const resData = await res.json();

    if (resData?.hasPeriodSelected === false) {
      return {
        data: {
          hasPeriodSelected: false,
          isPeriodClosed: false,
          totalAssets: 0,
          totalLiabilities: 0,
          totalEquity: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          netIncome: 0,
          cashAccounts: [],
          totalCashOnHand: 0,
          bankAccounts: [],
          totalBankBalance: 0,
          expenseAccountsList: [],
          chartTrend: [],
          recentEntries: [],
        },
        error: null,
      };
    }

    const formattedData: DashboardViewModel = {
      hasPeriodSelected: true,
      selectedPeriodName: resData?.selectedPeriodName || "Current Period",
      isPeriodClosed: Boolean(resData?.isPeriodClosed),
      totalAssets: Number(resData?.totalAssets) || 0,
      totalLiabilities: Number(resData?.totalLiabilities) || 0,
      totalEquity: Number(resData?.totalEquity) || 0,
      totalRevenue: Number(resData?.totalRevenue) || 0,
      totalExpenses: Number(resData?.totalExpenses) || 0,
      netIncome: Number(resData?.netIncome) || 0,
      cashAccounts: resData?.cashAccounts || [],
      totalCashOnHand: Number(resData?.totalCashOnHand) || 0,
      bankAccounts: resData?.bankAccounts || [],
      totalBankBalance: Number(resData?.totalBankBalance) || 0,
      expenseAccountsList: resData?.expenseAccountsList || [],
      chartTrend: resData?.chartTrend || [],
      recentEntries: resData?.recentEntries || [],
    };

    return { data: formattedData, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || "Failed to connect to server" };
  }
}
