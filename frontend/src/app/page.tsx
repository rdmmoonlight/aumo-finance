import LoginForm from "./auth/LoginForm"; // Import Client Component LoginForm yang dipisah

export const metadata = {
  title: "Aumo Finance - Sign In",
  description: "Operations, neatly organized.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.15fr_1fr] bg-black text-white">
      {/* LEFT PANEL */}
      <div className="bg-zinc-950 text-white flex flex-col justify-between p-8 lg:p-12 border-r border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black rounded flex items-center justify-center font-bold">
            A
          </div>
          <span className="font-semibold tracking-tight">AUMO FINANCE</span>
        </div>

        <div className="mt-12 lg:mt-0">
          <h1 className="text-4xl lg:text-6xl font-semibold leading-[0.95] tracking-[-0.03em] max-w-lg">
            Operations,
            <br />
            neatly
            <br />
            organized.
          </h1>
          <p className="text-sm leading-6 text-zinc-400 max-w-sm mt-6">
            Matte, tenang, tanpa distraksi. Dibuat untuk produksi, bukan
            pameran.
          </p>
          <div className="mt-12 border-t border-zinc-800">
            <div className="flex justify-between py-4 border-b border-zinc-800 text-xs">
              <span className="text-zinc-500 font-mono">01</span>
              <span>Revenues & Expenses</span>
            </div>
            <div className="flex justify-between py-4 border-b border-zinc-800 text-xs">
              <span className="text-zinc-500 font-mono">02</span>
              <span>Tracking</span>
            </div>
            <div className="flex justify-between py-4 border-b border-zinc-800 text-xs">
              <span className="text-zinc-500 font-mono">03</span>
              <span>Finance & Costings</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex justify-between text-xs font-mono text-zinc-500">
          <span>© rdmmoonlight 2026</span>
          <span>COOKIE AUTH • AUMO SYSTEM</span>
        </div>
      </div>

      {/* RIGHT PANEL (LOGIN FORM INTEGRATION) */}
      <div className="bg-black text-white flex items-center justify-center p-6 lg:p-12">
        <LoginForm />
      </div>
    </div>
  );
}
