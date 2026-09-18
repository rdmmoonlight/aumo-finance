import Periods from "@/app/(authenticated)/periods/Periods";

export const metadata = {
  title: "Accounting Periods | Aumo Finance",
  description: "Kelola periode akuntansi dan pembukaan saldo awal.",
};

export default function PeriodsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <Periods />
    </div>
  );
}
