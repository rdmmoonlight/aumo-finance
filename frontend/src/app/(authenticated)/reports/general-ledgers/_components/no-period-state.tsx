// no-period-state.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
export function NoPeriodState() {
  return (
    <Card className="py-16 text-center border-dashed">
      <CardContent className="space-y-3">
        <EyeOff size={36} className="mx-auto text-muted-foreground" />
        <h3 className="text-sm font-semibold">No Period Selected</h3>
        <Button asChild size="sm" className="text-sm">
          <Link to="/periods" className="gap-1.5">
            <Calendar size={14} /> Go to Periods
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
