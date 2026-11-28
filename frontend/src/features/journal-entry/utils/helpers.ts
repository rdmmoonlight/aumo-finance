import { FieldErrors, Resolver } from "react-hook-form";
import { z } from "zod";

export function zodResolver<T extends z.ZodType<any, any, any>>(
  schema: T,
): Resolver<z.input<T>, any, z.output<T>> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, any> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.map(String);
      let target: Record<string, any> = errors;

      if (path.length === 0) path.push("root");
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        const nextKey = path[i + 1];
        if (!target[key]) {
          target[key] = /^\d+$/.test(nextKey) ? [] : {};
        }
        target = target[key];
      }

      const key = path[path.length - 1];
      if (!target[key]) {
        target[key] = { type: issue.code, message: issue.message };
      }
    }

    return {
      values: {} as z.input<T>,
      errors: errors as FieldErrors<z.input<T>>,
    };
  };
}

export interface LineItem {
  id: string;
  accountId: number;
  lineDescription: string;
  debit: string;
  credit: string;
}

export type AccountOption = {
  id: number;
  referenceNumber: number | string;
  accountName: string;
  [key: string]: any;
};

export const formatIDR = (amount: number) =>
  new Intl.NumberFormat("id-ID").format(amount);

export const formatNumberWithDots = (val: string | number): string => {
  if (!val) return "";
  const clean = val.toString().replace(/\D/g, "");
  if (!clean) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(clean, 10));
};
