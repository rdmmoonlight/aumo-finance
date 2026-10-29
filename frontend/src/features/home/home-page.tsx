import { Suspense } from "react";
import HomeContent from "./components/content";

export default function HomePage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h- w-full items-center justify-center text-white/50 text-sm">
                    Memuat halaman...
                </div>
            }
        >
            <HomeContent />
        </Suspense>
    );
}