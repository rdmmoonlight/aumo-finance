import { Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authApi } from "../auth/api/authApi";
import { AuthDialog } from "./components/auth-dialog";
import { LandingLeft } from "./components/landing-left";
import { LandingRight } from "./components/landing-right";

export default function LandingPage(): React.JSX.Element {
    const navigate = useNavigate();
    const { data: profile, isLoading: checkingAuth } = authApi.useGetProfileQuery();
    const isAuthenticated = Boolean(profile);

    const [open, setOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "register">("login");

    const handleOpenModal = (mode: "login" | "register") => {
        setAuthMode(mode);
        setOpen(true);
    };

    const handleSuccess = () => {
        setOpen(false);
        navigate({ to: "/home", replace: true });
    };

    // Redirect otomatis jika user sudah login
    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
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