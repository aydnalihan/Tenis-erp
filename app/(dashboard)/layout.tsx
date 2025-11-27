import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
