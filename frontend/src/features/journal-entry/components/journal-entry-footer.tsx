import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface JournalEntryFooterProps {
  isEdit: boolean;
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  isSubmitting: boolean;
  onReset: () => void;
}

export function JournalEntryFooter({
  isEdit,
  isBalanced,
  totalDebit,
  totalCredit,
  isSubmitting,
  onReset,
}: JournalEntryFooterProps) {
  const handleClickValidation = () => {
    if (isSubmitting) return;

    if (!isBalanced) {
      if (totalDebit === 0 && totalCredit === 0) {
        toast.error("Gagal menyimpan: Nominal debit dan kredit masih kosong.");
      } else {
        const diff = Math.abs(totalDebit - totalCredit).toLocaleString("id-ID");
        toast.error(
          `Jurnal tidak balance! Selisih: Rp ${diff}. (Debit: Rp ${totalDebit.toLocaleString(
            "id-ID",
          )} vs Kredit: Rp ${totalCredit.toLocaleString("id-ID")})`,
        );
      }
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="text-sm"
        disabled={isSubmitting}
      >
        Reset
      </Button>

      {/* Pembungkus div menangkap event klik saat tombol dalam kondisi tidak siap submit */}
      <div onClick={handleClickValidation} className="inline-block">
        <Button
          type="submit"
          disabled={!isBalanced || isSubmitting}
          className="gap-2 text-sm font-medium pointer-events-auto disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {isEdit ? "Save Changes" : "Post Journal Entry"}
        </Button>
      </div>
    </div>
  );
}
