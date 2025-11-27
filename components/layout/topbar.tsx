'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, Command, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MobileSidebar } from './sidebar';
import { createClient } from '@/lib/supabase/client';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

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

  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase()
    : 'AD';
  const userEmail = user?.email || 'admin@teniskulubu.com';
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin User';

  return (
    <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between bg-white/80 backdrop-blur-md border-b border-green-100 px-4 md:px-8">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <MobileSidebar />
        {title && (
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-green-900">
              {title}
            </h1>
          </div>
        )}
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex flex-1 max-w-lg mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
          <Input
            type="search"
            placeholder="Üye, grup veya ders ara..."
            className="w-full h-11 pl-11 pr-20 bg-green-50/50 border-green-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:border-green-400 focus:ring-green-200 focus:bg-white transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:flex h-6 items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 text-[10px] font-medium text-green-600">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-10 w-10 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-10 w-10 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-[380px] bg-white border-green-100 p-0 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-green-900">Bildirimler</h3>
                <Badge className="bg-green-100 text-green-700 border-0 text-[10px] px-1.5">
                  3 yeni
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50 h-7">
                Tümünü okundu işaretle
              </Button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              <div className="p-2">
                <div className="flex gap-3 p-3 rounded-xl hover:bg-green-50 cursor-pointer transition-colors group">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">Yeni ödeme alındı</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      Ahmet Yılmaz - Kasım 2024 aidatı ödendi
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      5 dakika önce
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl hover:bg-green-50 cursor-pointer transition-colors">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">Devamsızlık uyarısı</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      3 üye art arda 2 ders kaçırdı
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      1 saat önce
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl hover:bg-green-50 cursor-pointer transition-colors">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">Geciken ödemeler</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      5 üyenin aidatı gecikmiş durumda
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      2 saat önce
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-2 border-t border-green-100">
              <Button 
                variant="ghost" 
                className="w-full h-10 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
              >
                Tüm bildirimleri gör
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="hidden sm:block h-8 w-px bg-green-200" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-3 h-auto py-1.5 px-2 rounded-xl hover:bg-green-50"
            >
              <Avatar className="h-9 w-9 ring-2 ring-green-200">
                <AvatarImage src="/avatars/admin.png" alt="Admin" />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-medium text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-800">{userName.split(' ')[0] || 'Admin'}</span>
                <span className="text-[11px] text-gray-500">Yönetici</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-64 bg-white border-green-100 rounded-xl p-2 shadow-xl"
          >
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 mb-2">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>
            
            <DropdownMenuItem className="h-10 rounded-lg text-gray-700 hover:text-green-700 hover:bg-green-50 cursor-pointer">
              <User className="mr-3 h-4 w-4 text-gray-400" />
              <span>Profil Ayarları</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="h-10 rounded-lg text-gray-700 hover:text-green-700 hover:bg-green-50 cursor-pointer">
              <Badge className="mr-3 bg-green-100 text-green-700 border-0 text-[10px]">
                Admin
              </Badge>
              <span>Rol: Yönetici</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-green-100 my-2" />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="h-10 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Çıkış Yap</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
