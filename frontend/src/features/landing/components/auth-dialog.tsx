import { AuthFormSkeleton, GOOGLE_CLIENT_ID } from "#/features/auth/auth";
import LoginPage from "#/features/auth/login-page";
import RegisterPage from "#/features/auth/register-page";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Suspense } from "react";

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    authMode: "login" | "register";
    onSuccess: () => void;
};

export function AuthDialog({ open, onOpenChange, authMode, onSuccess }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden border-zinc-800 bg-zinc-950 p-0 text-white sm:max-w-md">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-lg font-medium text-zinc-100">
                        {authMode === "login" ? "Sign In to Aumo" : "Create an Account"}
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6 pt-4">
                    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                        <Suspense fallback={<AuthFormSkeleton />}>
                            {authMode === "login" ? (
                                <LoginPage initialMode="login" onSuccess={onSuccess} />
                            ) : (
                                <RegisterPage initialMode="register" onSuccess={onSuccess} />
                            )}
                        </Suspense>
                    </GoogleOAuthProvider>
                </div>
            </DialogContent>
        </Dialog>
    );
}