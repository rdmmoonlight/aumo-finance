import {
  useGetJournalEntryByIdQuery,
  useGetNextTransactionNumberQuery,
} from "../api/journalEntryApi";

export function useJournalEntryDetail(
  isEdit: boolean,
  entryId: number,
  journalType: string,
  entryDate: string,
  setValue: any,
) {
  const txQuery = useGetNextTransactionNumberQuery(
    { journalType, entryDate },
    { skip: isEdit },
  );
  const detailQuery = useGetJournalEntryByIdQuery(
    { id: entryId },
    { skip: !isEdit },
  );

  const nextTxNumber = !isEdit
    ? (txQuery.data as any)?.transactionNumber ||
      (txQuery.data as any)?.data ||
      (txQuery.data as string)
    : null;
  const editData = detailQuery.data as any;
  const jData = editData?.entry || editData?.data || editData;

  // hydration saat edit - pindah dari useEffect di page ke sini
  // panggil di useEffect sekali saja di hook ini
  return {
    nextTxNumber,
    editData,
    isTxLoading: txQuery.isLoading,
    isEditLoading: detailQuery.isLoading,
    displayedTxNumber: isEdit
      ? jData?.transactionNumber || "Loading..."
      : nextTxNumber || "Loading...",
    isLocked: Boolean(editData?.isLocked || editData?.entry?.isLocked),
    jData,
  };
}
