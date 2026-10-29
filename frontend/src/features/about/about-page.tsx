export default function AboutPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl">A</div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">About AumoFinance</h1>
                        <p className="text-sm text-slate-400">Arsitektur Backend .NET & Next.js Single Container</p>
                    </div>
                </div>

                <p className="text-slate-300 leading-relaxed mb-6">
                    AumoFinance adalah platform keuangan yang menggabungkan kecepatan backend{" "}
                    <span className="text-indigo-400 font-semibold">ASP.NET Core</span>, modul performa{" "}
                    <span className="text-amber-400 font-semibold">Rust Axum (FFI)</span>, dan antarmuka modern{" "}
                    <span className="text-sky-400 font-semibold">Next.js</span> dalam satu ekosistem terisolasi di Nginx & Supervisord.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <span className="text-xs text-slate-400 block mb-1">Architecture</span>
                        <span className="text-sm font-medium text-slate-200">Nginx Reverse Proxy</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <span className="text-xs text-slate-400 block mb-1">API Documentation</span>
                        <span className="text-sm font-medium text-emerald-400">Scalar OpenApi v1</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-800 pt-6">
                    <a href="/reference/" target="_blank" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-white">
                        Buka Scalar API Reference
                    </a>
                    <a href="/health" target="_blank" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 border border-slate-700">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Health Status
                    </a>
                </div>
            </div>
        </main>
    );
}