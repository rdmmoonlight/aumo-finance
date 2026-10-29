import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Lock, UserPlus } from "lucide-react";

type Props = {
    checkingAuth: boolean;
    onLogin: () => void;
    onRegister: () => void;
};

export function LandingRight({ checkingAuth, onLogin, onRegister }: Props) {
    return (
        <div className="flex flex-col items-center justify-center gap-6 bg-black p-6 lg:p-12">
            <div className="max-w-sm text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Selamat Datang</h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Silakan masuk atau buat akun baru untuk mengakses dashboard.
                </p>
            </div>

            <div className="flex w-full max-w-sm flex-col items-center gap-3 sm:flex-row">
                <Button
                    disabled={checkingAuth}
                    onClick={onLogin}
                    className="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
                >
                    {checkingAuth ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    <span>{checkingAuth ? "Checking..." : "Sign In"}</span>
                    {!checkingAuth && <ArrowRight className="h-4 w-4" />}
                </Button>
                <Button
                    disabled={checkingAuth}
                    onClick={onRegister}
                    variant="outline"
                    className="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                >
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                </Button>
            </div>
        </div>
    );
}