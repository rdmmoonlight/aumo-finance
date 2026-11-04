// features/periods/types.ts
import type {
  CreatePeriodFormValues,
  CreatePeriodOutputValues,
} from "@/lib/validations/period";

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
  periodName: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  isClosed?: boolean;
  isSelected?: boolean;
  status?: string;
  [key: string]: any;
}

export interface OpenInfoData {
  hasExistingPermanentAccounts?: boolean;
  availableCashAndBankAccounts?: AccountItem[];
  availableRetainedEarningsAccounts?: AccountItem[];
}

export interface CreatePeriodValues {
  month?: number;
  year?: number;
  setupMode?: "LoadExisting" | "CreateNew";
  cashAccountId?: string;
  bankAccountId?: string;
  retainedId?: string;
  cashAccountCode?: string;
  cashAccountName?: string;
  cashBalance?: number | "";
  bankAccountCode?: string;
  bankAccountName?: string;
  bankBalance?: number | "";
  retainedCode?: string;
  retainedName?: string;
}

// FIX: pakai any biar gak clash sama PeriodItem dari api
export type PeriodAction = (p: any) => void | Promise<void>;

export interface GetPeriodColumnsProps {
  selectedPeriod: PeriodItem | null;
  selectingId: number | null;
  closingId: number | null;
  isSelecting?: boolean;
  isClosing?: boolean;
  onSelectPeriod?: PeriodAction;
  onClosePeriod?: PeriodAction;
  onSelect?: PeriodAction;
  onClose?: PeriodAction;
}

export interface PeriodsTableProps extends GetPeriodColumnsProps {
  periods: PeriodItem[];
  isLoading?: boolean;
  isClearing?: boolean;
}

export type UnifiedTableProps = PeriodsTableProps;

export interface PeriodListProps {
  periods: PeriodItem[];
  selectedPeriod: PeriodItem | null;
  isLoading: boolean;
  isClearing: boolean;
  selectingId: number | null;
  closingId: number | null;
  onClearSelection: () => void;
  onSelectPeriod: PeriodAction;
  onClosePeriod: PeriodAction;
  onOpenCreateView: () => void;
}

export interface PeriodListCardProps extends PeriodsTableProps {
  onClearSelection?: () => void;
  onOpenCreate?: () => void;
  onOpenCreateView?: () => void;
}

export interface CreatePeriodFormProps {
  openInfo?: OpenInfoData | null;
  isLoadingOpenInfo?: boolean;
  isCreating?: boolean;
  isLoading?: boolean;
  initialValues?: Partial<CreatePeriodFormValues>;
  defaultValues?: Partial<CreatePeriodFormValues>;
  onSubmit: (values: CreatePeriodOutputValues) => void | Promise<void>;
  onCancel: () => void;
  [key: string]: any;
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
