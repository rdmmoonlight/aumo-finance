import { useAppRouter } from "@/lib/router-compat";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/use-auth";

export function useAuthCheck() {
    const router = useAppRouter();
    const { refetchProfile } = useAuth();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        document.title = "Aumo Finance | Operations, neatly organized.";

        async function checkAuthStatus() {
            try {
                setCheckingAuth(true);
                const result = await refetchProfile();
                if (result.isSuccess && result.data?.success) {
                    setIsAuthenticated(true);
                    router.replace("/home");
                } else {
                    setIsAuthenticated(false);
                }
            } catch {
                setIsAuthenticated(false);
            } finally {
                setCheckingAuth(false);
            }
        }

        checkAuthStatus();
    }, [refetchProfile, router]);

    return { router, checkingAuth, isAuthenticated };
}