import { useAppRouter } from "@/lib/router-compat";
import { store } from "@/lib/store";
import { authApi } from "@/lib/store/auth/authApi";
import { useEffect, useState } from "react";

export function useAuthCheck() {
    const router = useAppRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        document.title = "Aumo Finance | Operations, neatly organized.";

        async function checkAuthStatus() {
            try {
                setCheckingAuth(true);
                const result = await store.dispatch(
                    authApi.endpoints.getProfile.initiate()
                );
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
    }, [router]);

    return { router, checkingAuth, isAuthenticated };
}