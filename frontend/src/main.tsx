import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ReduxProvider } from "@/components/redux-provider";
import { ThemeProvider } from "@/components/theme-provider";
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import "@/styles/index.css";

type PageModule = { default: React.ComponentType };

// Rute dibentuk otomatis dari src/app/**/page.tsx (struktur ala Next.js).
// "(authenticated)" adalah grup rute: tidak masuk ke URL, tetapi dibungkus layout sesi.
const modules = import.meta.glob<PageModule>("./app/**/page.tsx");

function toPath(file: string): string {
  const path = file
    .replace("./app", "")
    .replace(/\/page\.tsx$/, "")
    .replace(/\/\([^)]+\)/g, "");
  return path === "" ? "/" : path;
}

const routes = Object.entries(modules).map(([file, loader]) => ({
  path: toPath(file),
  protected: file.includes("/(authenticated)/"),
  Component: React.lazy(loader),
}));

function ProtectedShell(): React.JSX.Element {
  return (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  );
}

function Fallback(): React.JSX.Element {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <p className="text-sm text-muted-foreground">Memuat...</p>
    </div>
  );
}

function App(): React.JSX.Element {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {routes
          .filter((r) => !r.protected)
          .map((r) => (
            <Route key={r.path} path={r.path} element={<r.Component />} />
          ))}
        <Route element={<ProtectedShell />}>
          {routes
            .filter((r) => r.protected)
            .map((r) => (
              <Route key={r.path} path={r.path} element={<r.Component />} />
            ))}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ReduxProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ReduxProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
