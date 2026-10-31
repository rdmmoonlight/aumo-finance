import { ReduxProvider } from "@/components/redux-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Outlet } from "@tanstack/react-router";

export default function RootLayout() {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ReduxProvider>
                <Outlet />
            </ReduxProvider>
        </ThemeProvider>
    );
}