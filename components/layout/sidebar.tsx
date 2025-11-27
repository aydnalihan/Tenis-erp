'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Calendar,
  ClipboardCheck,
  CreditCard,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Üyeler',
    href: '/members',
    icon: Users,
  },
  {
    title: 'Gruplar',
    href: '/groups',
    icon: UsersRound,
  },
  {
    title: 'Dersler',
    href: '/lessons',
    icon: Calendar,
  },
  {
    title: 'Yoklama',
    href: '/attendance',
    icon: ClipboardCheck,
  },
  {
    title: 'Ödemeler',
    href: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Envanter',
    href: '/inventory',
    icon: Package,
  },
  {
    title: 'Raporlar',
    href: '/reports',
    icon: BarChart3,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      window.location.href = '/login';
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'relative flex h-full flex-col bg-white border-r border-green-100 transition-all duration-300 ease-out shadow-sm',
          collapsed ? 'w-[80px]' : 'w-[280px]',
          className
        )}
      >
        {/* Logo Area */}
        <div className="flex h-20 items-center justify-between px-5 border-b border-green-100 bg-gradient-to-r from-white to-green-50/50">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg glow-green-sm">
                <span className="text-2xl">🎾</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-800">
                  TenisERP
                </span>
                <span className="text-[11px] text-green-600/70 font-medium">
                  Kulüp Yönetimi
                </span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <span className="text-2xl">🎾</span>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-6">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'w-full h-12 rounded-xl transition-all duration-200',
                            isActive
                              ? 'bg-green-100 text-green-700 shadow-sm'
                              : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="bg-white border-green-100 shadow-lg"
                    >
                      <p className="font-medium text-green-800">{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer',
                      isActive
                        ? 'bg-gradient-to-r from-green-100 to-green-50 shadow-sm'
                        : 'hover:bg-green-50'
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-r-full" />
                    )}
                    
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-green-50 text-green-600 group-hover:bg-green-100'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <span
                      className={cn(
                        'font-medium transition-colors',
                        isActive ? 'text-green-800' : 'text-gray-600 group-hover:text-green-700'
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="border-t border-green-100 p-4 bg-gradient-to-t from-green-50/50 to-transparent">
          {collapsed ? (
            <div className="flex flex-col gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-11 rounded-xl text-gray-500 hover:text-green-700 hover:bg-green-50"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white border-green-100">
                  Ayarlar
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="w-full h-11 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white border-green-100">
                  Çıkış Yap
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 px-4 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50"
              >
                <Settings className="h-5 w-5" />
                Ayarlar
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3 h-11 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Çıkış Yap
              </Button>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-24 h-8 w-8 rounded-full bg-white border border-green-200 shadow-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 text-green-600 transition-transform duration-200',
              collapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>
    </TooltipProvider>
  );
}

// Mobile Sidebar using Sheet
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      window.location.href = '/login';
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-10 w-10 rounded-xl text-green-700 hover:bg-green-50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 bg-white border-green-100">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center px-5 border-b border-green-100 bg-gradient-to-r from-white to-green-50/50">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <span className="text-2xl">🎾</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-800">
                  TenisERP
                </span>
                <span className="text-[11px] text-green-600/70 font-medium">
                  Kulüp Yönetimi
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-6">
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-green-100 to-green-50 shadow-sm'
                          : 'hover:bg-green-50'
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-r-full" />
                      )}
                      
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                          isActive
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-green-50 text-green-600 group-hover:bg-green-100'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <span
                        className={cn(
                          'font-medium transition-colors',
                          isActive ? 'text-green-800' : 'text-gray-600 group-hover:text-green-700'
                        )}
                      >
                        {item.title}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Bottom */}
          <div className="border-t border-green-100 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 px-4 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50"
            >
              <Settings className="h-5 w-5" />
              Ayarlar
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 h-11 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
