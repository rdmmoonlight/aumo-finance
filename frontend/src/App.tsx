import { ReduxProvider } from "@/components/redux-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ReduxProvider>
        <RouterProvider router={router} />
      </ReduxProvider>
    </ThemeProvider>
  );
}
