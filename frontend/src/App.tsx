import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Router dibuat satu kali di tingkat modul, bukan di dalam komponen,
// agar tidak ikut dibuat ulang setiap App dirender.
const router = createRouter({ routeTree });

// Mendaftarkan tipe router agar <Link>, useNavigate, dan useParams
// terbaca aman secara tipe di seluruh aplikasi.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Provider Redux dan Theme sengaja TIDAK dipasang di sini.
// Keduanya sudah dipasang di src/components/layouts/root-layout.tsx
// (dipakai oleh src/routes/__root.tsx). Memasangnya lagi di sini
// akan membuat provider ganda.
export default function App() {
  return <RouterProvider router={router} />;
}
