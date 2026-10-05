TSX
// no-period-state.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, EyeOff } from "lucide-react";
import Link from "next/link";
export function NoPeriodState() {
  return (
    <Card className="py-16 text-center border-dashed">
      <CardContent className="space-y-3">
        <EyeOff size={36} className="mx-auto text-muted-foreground" />
        <h3 className="text-sm font-semibold">No Period Selected</h3>
        <Button asChild size="sm" className="text-sm"><Link href="/periods" className="gap-1.5"><Calendar size={14}/> Go to Periods</Link></Button>
      </CardContent>
    </Card>
  );
}

// page-header.tsx
import { BookOpen } from "lucide-react";
export function PageHeader({ title, subtitle, switchHref, switchLabel }: { title: string, subtitle: string, switchHref: string, switchLabel: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><BookOpen className="text-primary" size={22}/> {title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <Button asChild variant="outline" size="sm" className="text-sm"><Link href={switchHref}>{switchLabel}</Link></Button>
    </div>
  );
}