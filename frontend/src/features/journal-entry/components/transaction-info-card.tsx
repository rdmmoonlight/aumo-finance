import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { journalEntrySchema } from "@/lib/validations/journal-entry";
import { Loader2 } from "lucide-react";
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { z } from "zod";

interface TransactionInfoCardProps {
  displayedTxNumber: string;
  isTxLoading: boolean;
  register: UseFormRegister<z.input<typeof journalEntrySchema>>;
  setValue: UseFormSetValue<z.input<typeof journalEntrySchema>>;
  watch: UseFormWatch<z.input<typeof journalEntrySchema>>;
  errors: FieldErrors<z.input<typeof journalEntrySchema>>;
}

export function TransactionInfoCard({
  displayedTxNumber,
  isTxLoading,
  register,
  setValue,
  watch,
  errors,
}: TransactionInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Transaction Info
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center justify-between">
            <span>Transaction No.</span>
            {isTxLoading && (
              <Loader2
                size={12}
                className="animate-spin text-muted-foreground"
              />
            )}
          </Label>
          <Input
            className="h-9 font-mono bg-muted text-sm"
            value={displayedTxNumber}
            readOnly
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Journal Type</Label>
          <Select
            value={watch("journalType")}
            onValueChange={(v) =>
              setValue("journalType", v, { shouldValidate: true })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-sm">
              <SelectItem value="General">General Journal (GJ)</SelectItem>
              <SelectItem value="Adjusting">Adjusting Entry (AJ)</SelectItem>
            </SelectContent>
          </Select>
          {errors.journalType && (
            <p className="text-xs text-red-500 font-medium">
              {errors.journalType?.message as string}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Date</Label>
          <Input
            type="date"
            className="h-9 text-sm"
            {...register("entryDate")}
          />
          {errors.entryDate && (
            <p className="text-xs text-red-500 font-medium">
              {errors.entryDate?.message as string}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
