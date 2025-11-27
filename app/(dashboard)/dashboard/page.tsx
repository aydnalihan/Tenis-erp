'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  UsersRound, 
  Calendar, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  Activity,
  Zap,
  Target,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// Demo data
const stats = [
  {
    title: 'Toplam Üye',
    value: '124',
    change: '+12%',
    trend: 'up',
    icon: Users,
    description: 'Son 30 gün',
  },
  {
    title: 'Aktif Gruplar',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: UsersRound,
    description: 'Bu ay',
  },
  {
    title: 'Bu Ayki Dersler',
    value: '48',
    change: '12 kalan',
    trend: 'neutral',
    icon: Calendar,
    description: 'Kasım 2024',
  },
  {
    title: 'Bekleyen Ödemeler',
    value: '₺12,450',
    change: '18 üye',
    trend: 'down',
    icon: CreditCard,
    description: 'Vadesi geçmiş',
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'payment',
    message: 'Ahmet Yılmaz Kasım aidatını ödedi',
    time: '5 dakika önce',
    status: 'success',
    icon: CreditCard,
  },
  {
    id: 2,
    type: 'attendance',
    message: 'Yıldızlar grubu dersi tamamlandı',
    time: '1 saat önce',
    status: 'info',
    icon: Users,
    detail: '12/15 katılım',
  },
  {
    id: 3,
    type: 'member',
    message: 'Yeni üye kaydı: Elif Kaya',
    time: '2 saat önce',
    status: 'success',
    icon: Users,
  },
];

const upcomingLessons = [
  {
    id: 1,
    group: 'Yetişkinler A',
    time: '10:00 - 11:30',
    students: 12,
    coach: 'Mehmet Hoca',
    color: 'bg-green-500',
  },
  {
    id: 2,
    group: 'Gençler B',
    time: '14:00 - 15:30',
    students: 8,
    coach: 'Ali Hoca',
    color: 'bg-emerald-500',
  },
  {
    id: 3,
    group: 'Minikler',
    time: '16:00 - 17:00',
    students: 15,
    coach: 'Ayşe Hoca',
    color: 'bg-teal-500',
  },
];

const topMembers = [
  { name: 'Ahmet Yılmaz', attendance: 98, group: 'Yetişkinler A' },
  { name: 'Elif Demir', attendance: 96, group: 'Gençler B' },
  { name: 'Can Özkan', attendance: 94, group: 'Yıldızlar' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 page-transition">
      {/* Welcome Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <p className="text-green-600 text-xs sm:text-sm font-medium mb-1">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Hoş Geldiniz! 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Tenis kulübünüzün genel durumunu buradan takip edebilirsiniz.
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
          <Link href="/members" className="flex-1 xs:flex-none">
            <Button className="w-full xs:w-auto bg-green-600 hover:bg-green-700 text-white gap-2 btn-shine shadow-lg shadow-green-200 text-sm sm:text-base">
              <Users className="h-4 w-4" />
              Üye Ekle
            </Button>
          </Link>
          <Link href="/lessons" className="flex-1 xs:flex-none">
            <Button variant="outline" className="w-full xs:w-auto border-green-200 text-green-700 hover:bg-green-50 gap-2 text-sm sm:text-base">
              <Calendar className="h-4 w-4" />
              Ders Planla
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card 
              key={stat.title} 
              className="relative overflow-hidden bg-white border-green-100 card-hover shadow-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
              
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 leading-tight">
                  {stat.title}
                </CardTitle>
                <div className="rounded-lg sm:rounded-xl p-1.5 sm:p-2 lg:p-2.5 bg-green-100 flex-shrink-0">
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
                  {stat.trend === 'up' && (
                    <div className="flex items-center gap-0.5 sm:gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-[10px] sm:text-xs font-medium">{stat.change}</span>
                    </div>
                  )}
                  {stat.trend === 'down' && (
                    <div className="flex items-center gap-0.5 sm:gap-1 text-amber-600">
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-[10px] sm:text-xs font-medium">{stat.change}</span>
                    </div>
                  )}
                  {stat.trend === 'neutral' && (
                    <div className="flex items-center gap-0.5 sm:gap-1 text-gray-500">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-[10px] sm:text-xs font-medium">{stat.change}</span>
                    </div>
                  )}
                  <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 bg-white border-green-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-2 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg text-gray-900">Son Aktiviteler</CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Kulüpteki son gelişmeler</p>
            </div>
            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs sm:text-sm hidden sm:flex">
              Tümünü Gör
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                const statusClasses = {
                  success: 'bg-green-100 text-green-600',
                  warning: 'bg-amber-100 text-amber-600',
                  error: 'bg-red-100 text-red-500',
                  info: 'bg-blue-100 text-blue-600',
                }[activity.status];

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50/50 hover:bg-green-50/50 transition-all cursor-pointer group border border-transparent hover:border-green-100"
                  >
                    <div className={`rounded-lg sm:rounded-xl p-2 sm:p-2.5 ${statusClasses} flex-shrink-0`}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-green-800 line-clamp-2">
                        {activity.message}
                      </p>
                      {activity.detail && (
                        <Badge className="mt-1 bg-green-100 text-green-700 border-0 text-[10px]">
                          {activity.detail}
                        </Badge>
                      )}
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-green-500 transition-colors hidden sm:block flex-shrink-0" />
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-green-600 hover:text-green-700 hover:bg-green-50 text-xs sm:hidden">
              Tümünü Gör
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Lessons */}
        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-2 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg text-gray-900">Yaklaşan Dersler</CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Bugünkü program</p>
            </div>
            <Link href="/lessons">
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {upcomingLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="relative p-3 sm:p-4 rounded-xl bg-gray-50/50 hover:bg-green-50/50 transition-all cursor-pointer overflow-hidden group border border-transparent hover:border-green-100"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${lesson.color}`} />
                  
                  <div className="flex items-center justify-between pl-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base text-gray-800 group-hover:text-green-800 truncate">
                        {lesson.group}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                        {lesson.coach}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-700">
                        {lesson.time.split(' - ')[0]}
                      </p>
                      <Badge className="mt-1 bg-green-100 text-green-700 border-0 text-[10px]">
                        {lesson.students} kişi
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/lessons">
              <Button 
                variant="outline" 
                className="w-full mt-3 sm:mt-4 border-green-200 text-green-700 hover:bg-green-50 text-xs sm:text-sm"
              >
                Tüm Dersleri Gör
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Attendance Rate */}
        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg sm:rounded-xl p-2 sm:p-2.5 bg-green-100">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Katılım Oranı</CardTitle>
                <p className="text-[10px] sm:text-xs text-gray-400">Bu ay ortalaması</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex items-end justify-between mb-2 sm:mb-3">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600">87%</div>
              <div className="flex items-center gap-1 text-green-600 text-xs sm:text-sm">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                +3%
              </div>
            </div>
            <div className="h-2 rounded-full bg-green-100 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                style={{ width: '87%' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg sm:rounded-xl p-2 sm:p-2.5 bg-amber-100">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Ödeme Durumu</CardTitle>
                <p className="text-[10px] sm:text-xs text-gray-400">Kasım tahsilatı</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex items-end justify-between mb-2 sm:mb-3">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-600">78%</div>
              <div className="text-xs sm:text-sm text-gray-500">
                97 / 124 üye
              </div>
            </div>
            <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000"
                style={{ width: '78%' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-white border-green-100 shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg sm:rounded-xl p-2 sm:p-2.5 bg-emerald-100">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">En İyi Katılım</CardTitle>
                <p className="text-[10px] sm:text-xs text-gray-400">Bu ay</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {topMembers.map((member, i) => (
                <div key={member.name} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-green-100 text-[10px] sm:text-xs font-medium text-green-700">
                    {i + 1}
                  </div>
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarFallback className="bg-green-50 text-green-600 text-[10px] sm:text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{member.name}</p>
                  </div>
                  <Badge className={`
                    ${i === 0 ? 'bg-green-100 text-green-700' : 
                      i === 1 ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-teal-100 text-teal-700'}
                    border-0 text-[10px] sm:text-xs
                  `}>
                    %{member.attendance}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
