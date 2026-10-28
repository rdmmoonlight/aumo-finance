import { Link } from '@tanstack/react-router';
export function AppFooter() {
  return (
    <footer className="w-full border-t border-border/40 py-3">
      <div className="flex flex-col items-center justify-center gap-1 px-6 text-center">
        {/* Caption (12px) */}
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Aumo Finance. All rights reserved.
        </p>

        {/* Link Navigasi About & API Reference */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground my-0.5">
          <Link 
            to="/about" 
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            About
          </Link>
          <span>•</span>
          <a
            href="/reference/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            API Reference
          </a>
        </div>

        {/* Label kecil (11px) */}
        <p className="text-[11px] text-muted-foreground">
          by <span className="font-medium text-foreground">rdmmoonlight</span>
        </p>
      </div>
    </footer>
  );
}
