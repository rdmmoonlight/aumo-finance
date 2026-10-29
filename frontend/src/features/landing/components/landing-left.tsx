export function LandingLeft() {
    return (
        <div className="flex flex-col justify-between border-r border-zinc-800 bg-zinc-950 p-8 lg:p-12">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-white font-bold text-black">A</div>
                <span className="text-sm font-semibold tracking-tight">AUMO FINANCE</span>
            </div>

            <div className="mt-12 lg:mt-0">
                <h1 className="max-w-lg text-5xl font-semibold leading-[0.95] tracking-[-0.03em]">
                    Operations,<br /> neatly<br /> organized.
                </h1>
                <p className="mt-6 max-w-sm text-sm leading-6 text-zinc-400">
                    Matte, tenang, tanpa distraksi. Dibuat untuk produksi, bukan pameran.
                </p>

                <div className="mt-12 border-t border-zinc-800">
                    <div className="flex justify-between border-b border-zinc-800 py-4 text-xs">
                        <span className="font-mono text-zinc-500">01</span><span>Revenues & Expenses</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 py-4 text-xs">
                        <span className="font-mono text-zinc-500">02</span><span>Tracking</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 py-4 text-xs">
                        <span className="font-mono text-zinc-500">03</span><span>Finance & Costings</span>
                    </div>
                </div>
            </div>

            <div className="hidden justify-between font-mono text-xs text-zinc-500 lg:flex">
                <span>© rdmmoonlight 2026</span>
                <span>COOKIE AUTH • AUMO SYSTEM</span>
            </div>
        </div>
    );
}