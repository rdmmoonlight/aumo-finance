import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="min-h-svh w-full flex">
      {/* Sidebar Permanen Kiri */}
      <AppSidebar />

      {/* Area Kanan: TopBar + Main Content */}
      <div className="flex flex-1 flex-col min-w-0 h-svh overflow-hidden">
        {/* TopBar 2 Kelompok */}
        <TopBar />

        {/* Halaman Konten Utama */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}