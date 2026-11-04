import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function JournalFormActions({ isSubmitting, isEdit, onReset }: any) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={isSubmitting}
      >
        Reset
      </Button>
      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Save size={16} />
        )}
        {isEdit ? "Save Changes" : "Post Journal Entry"}
      </Button>
    </div>
  );
}
