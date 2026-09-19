import { SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/side-bar"
import { TopBar } from "@/components/top-bar"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider className="flex min-h-screen w-full">
      {/* Sidebar Permanen Kiri */}
      <Sidebar />

      {/* Area Kanan: TopBar + Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopBar 2 Kelompok */}
        <TopBar />

        {/* Halaman Konten Utama */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}