import "@/styles/index.css";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      {/* Tambahkan Navbar / Header global di sini jika ada */}
      <Outlet />
      {/* TanStackRouterDevtools / Footer */}
    </>
  );
}
