"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { IconSun, IconMoon, IconDeviceDesktop, IconCheck } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = [
    { id: "light", label: "Light", desc: "Terang", icon: IconSun },
    { id: "dark", label: "Dark", desc: "Gelap", icon: IconMoon },
    { id: "system", label: "System", desc: "Ikut OS", icon: IconDeviceDesktop },
  ] as const;

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Appearance</CardTitle><CardDescription className="text-xs">Pilih tema antarmuka.</CardDescription></CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <RadioGroup value={mounted? theme : "system"} onValueChange={v => setTheme(v)} className="grid grid-cols-3 gap-2.5">
          {options.map(opt => {
            const active = mounted && theme === opt.id;
            return (
              <Label key={opt.id} htmlFor={opt.id} className={cn("relative flex flex-col rounded-lg border p-3 cursor-pointer hover:bg-accent/50", active? "border-primary bg-primary/5" : "border-muted")}>
                <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />
                <opt.icon size={16} className={cn("mb-2", active && "text-primary")} />
                <span className="text-xs font-medium">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.desc}</span>
                {active && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground grid place-items-center"><IconCheck size={10} /></div>}
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
