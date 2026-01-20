import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto md:ml-0">
        <div className="container mx-auto p-4 md:p-6 pt-20 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
