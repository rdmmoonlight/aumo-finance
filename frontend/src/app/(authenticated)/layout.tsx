import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { getAuthUser } from "@/lib/auth";
import { getQuranVerse } from "@/lib/getQuranVerse";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, verse] = await Promise.all([getAuthUser(), getQuranVerse()]);

  return (
    <div className="flex min-h-screen w-full bg-background bg-[#0E0E0E]">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar verse={verse} />
        <main className="flex-1 p-6 lg:p-8 bg-[#0E0E0E]">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
