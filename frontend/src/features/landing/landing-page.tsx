import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AuthDialog } from "./components/auth-dialog";
import { LandingLeft } from "./components/landing-left";
import { LandingRight } from "./components/landing-right";
import { useAuthCheck } from "./hooks/use-auth-check";

export default function LandingPage(): React.JSX.Element {
    const { router, checkingAuth, isAuthenticated } = useAuthCheck();
    const [open, setOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "register">("login");

    const handleOpenModal = (mode: "login" | "register") => {
        setAuthMode(mode);
        setOpen(true);
    };

    const handleSuccess = () => {
        setOpen(false);
        router.replace("/home");
    };

    if (isAuthenticated) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-black text-white">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting to dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid min-h-screen w-full bg-black text-white lg:grid-cols-[1.15fr_1fr]">
            <LandingLeft />
            <LandingRight
                checkingAuth={checkingAuth}
                onLogin={() => handleOpenModal("login")}
                onRegister={() => handleOpenModal("register")}
            />
            <AuthDialog open={open} onOpenChange={setOpen} authMode={authMode} onSuccess={handleSuccess} />
        </div>
    );
}