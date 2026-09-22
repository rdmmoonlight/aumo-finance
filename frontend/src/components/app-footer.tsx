export function AppFooter() {
  return (
    <footer className="w-full border-t border-border/40 py-3">
      <div className="flex flex-col items-center justify-center gap-1 px-6 text-center">
        <p className="text-[9px] leading-[1.5] text-muted-foreground">
          © {new Date().getFullYear()} Aumo Finance. All rights reserved.
        </p>
        <p className="text-[9px] leading-[1.5] text-muted-foreground">
          by <span className="text-[9px] text-foreground">rdmmoonlight</span>
        </p>
      </div>
    </footer>
  );
}
