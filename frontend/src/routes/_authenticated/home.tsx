import { createFileRoute } from '@tanstack/react-router';

import { Suspense } from "react";
import HomeContent from "../../features/home/components/content";

function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] w-full items-center justify-center text-white/50 text-sm">
          Memuat halaman...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

export const Route = createFileRoute('/_authenticated/home')({
  component: HomePage,
});
