export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 py-4">
      <div className="flex flex-col items-center justify-between gap-2 px-6 text-sm text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} Aumo Finance. All rights reserved.</p>
        <p>
          by <span className="font-semibold text-foreground">rdmmoonlight</span>
        </p>
      </div>
    </footer>
  );
}
