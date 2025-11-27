'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
import { membersService } from '@/services/members.service';
import { groupsService } from '@/services/groups.service';
import { lessonsService } from '@/services/lessons.service';
import { paymentsService } from '@/services/payments.service';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { Lesson, MemberWithGroup, PaymentWithMember } from '@/types';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeGroups: 0,
    monthlyLessons: 0,
    pendingPayments: 0,
    pendingPaymentsCount: 0,
  });
  type ActivityStatus = 'success' | 'warning' | 'error' | 'info';
  type Activity = {
    id: string;
    type: string;
    message: string;
    time: string;
    status: ActivityStatus;
    icon: React.ComponentType<{ className?: string }>;
    detail?: string;
  };
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [topMembers, setTopMembers] = useState<any[]>([]);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [paymentRate, setPaymentRate] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      const nextWeekDate = nextWeek.toISOString().split('T')[0];

      // Load members
      const membersResponse = await membersService.getAll({ 
        status: 'active',
        pageSize: 1000 
      });
      const totalMembers = membersResponse.total || 0;

      // Load groups
      const groupsResponse = await groupsService.getAll({ pageSize: 1000 });
      const activeGroups = groupsResponse.data?.length || 0;

      // Load lessons for this month
      const lessonsResponse = await lessonsService.getByDateRange(startDate, endDate);
      const monthlyLessons = lessonsResponse.data?.length || 0;

      // Load overdue payments
      const overdueResponse = await paymentsService.getOverdue();
      const overduePayments = overdueResponse.data || [];
      const pendingAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);

      // Load upcoming lessons (today + next 7 days)
      const upcomingResponse = await lessonsService.getByDateRange(today, nextWeekDate);
      const upcoming = (upcomingResponse.data || [])
        .filter(l => l.status === 'scheduled')
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.start_time.localeCompare(b.start_time);
        })
        .slice(0, 3)
        .map(l => ({
          id: l.id,
          group: groupsResponse.data?.find(g => g.id === l.group_id)?.name || 'Bilinmiyor',
          time: `${l.start_time} - ${l.end_time}`,
          students: membersResponse.data?.filter(m => m.group_id === l.group_id).length || 0,
          coach: groupsResponse.data?.find(g => g.id === l.group_id)?.coach?.full_name || 'Atanmadı',
          color: 'bg-green-500',
        }));

      // Load recent payments for activities
      const paymentsResponse = await paymentsService.getAll({ 
        pageSize: 10,
        sortBy: 'updated_at',
        sortOrder: 'desc',
      });
      const recentPayments: Activity[] = (paymentsResponse.data || [])
        .filter(p => p.paid && p.paid_at)
        .slice(0, 3)
        .map(p => ({
          id: p.id,
          type: 'payment',
          message: `${p.member.name} ${p.member.surname} ${p.period} aidatını ödedi`,
          time: formatDistanceToNow(new Date(p.paid_at!), { addSuffix: true, locale: tr }),
          status: 'success' as ActivityStatus,
          icon: CreditCard,
        }));

      // Load recent members for activities
      const recentMembers: Activity[] = (membersResponse.data || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 1)
        .map(m => ({
          id: m.id,
          type: 'member',
          message: `Yeni üye kaydı: ${m.name} ${m.surname}`,
          time: formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: tr }),
          status: 'success' as ActivityStatus,
          icon: Users,
        }));

      // Combine activities
      const activities: Activity[] = [...recentPayments, ...recentMembers]
        .sort((a, b) => {
          // Simple sort by time (recent first)
          return 0; // We'll keep the order as is
        })
        .slice(0, 3);

      // Calculate attendance rate (placeholder - would need attendance data)
      setAttendanceRate(87); // Placeholder

      // Calculate payment rate
      const allPaymentsResponse = await paymentsService.getAll({ pageSize: 1000 });
      const allPayments = allPaymentsResponse.data || [];
      const paidCount = allPayments.filter(p => p.paid).length;
      const totalPayments = allPayments.length;
      const rate = totalPayments > 0 ? Math.round((paidCount / totalPayments) * 100) : 0;
      setPaymentRate(rate);

      // Top members (placeholder - would need attendance stats)
      setTopMembers([
        { name: 'Veri yok', attendance: 0, group: '-' },
      ]);

      setStats({
        totalMembers,
        activeGroups,
        monthlyLessons,
        pendingPayments: pendingAmount,
        pendingPaymentsCount: overduePayments.length,
      });
      setRecentActivities(activities);
      setUpcomingLessons(upcoming);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
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
        {loading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="bg-white border-green-100">
                <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {([
              {
                title: 'Toplam Üye',
                value: stats.totalMembers.toString(),
                change: '',
                trend: 'neutral' as 'up' | 'down' | 'neutral',
                icon: Users,
                description: 'Aktif üyeler',
              },
              {
                title: 'Aktif Gruplar',
                value: stats.activeGroups.toString(),
                change: '',
                trend: 'neutral' as 'up' | 'down' | 'neutral',
                icon: UsersRound,
                description: 'Toplam grup',
              },
              {
                title: 'Bu Ayki Dersler',
                value: stats.monthlyLessons.toString(),
                change: '',
                trend: 'neutral' as 'up' | 'down' | 'neutral',
                icon: Calendar,
                description: new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
              },
              {
                title: 'Bekleyen Ödemeler',
                value: `₺${stats.pendingPayments.toLocaleString('tr-TR')}`,
                change: `${stats.pendingPaymentsCount} üye`,
                trend: (stats.pendingPaymentsCount > 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
                icon: CreditCard,
                description: 'Vadesi geçmiş',
              },
            ]).map((stat, index) => {
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
          </>
        )}
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
            {loading ? (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Henüz aktivite yok
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentActivities.map((activity) => {
                const Icon = activity.icon;
                const statusClasses: Record<ActivityStatus, string> = {
                  success: 'bg-green-100 text-green-600',
                  warning: 'bg-amber-100 text-amber-600',
                  error: 'bg-red-100 text-red-500',
                  info: 'bg-blue-100 text-blue-600',
                };
                const statusClass = statusClasses[activity.status];

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50/50 hover:bg-green-50/50 transition-all cursor-pointer group border border-transparent hover:border-green-100"
                  >
                    <div className={`rounded-lg sm:rounded-xl p-2 sm:p-2.5 ${statusClass} flex-shrink-0`}>
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
            )}
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
            {loading ? (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingLessons.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Yaklaşan ders yok
              </div>
            ) : (
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
            )}
            
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
            {loading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <div className="flex items-end justify-between mb-2 sm:mb-3">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600">{attendanceRate}%</div>
                  <div className="flex items-center gap-1 text-green-600 text-xs sm:text-sm">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    Bu ay
                  </div>
                </div>
                <div className="h-2 rounded-full bg-green-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </>
            )}
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
            {loading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <div className="flex items-end justify-between mb-2 sm:mb-3">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-600">{paymentRate}%</div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {stats.totalMembers > 0 ? `${Math.round((paymentRate / 100) * stats.totalMembers)} / ${stats.totalMembers} üye` : '0 üye'}
                  </div>
                </div>
                <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000"
                    style={{ width: `${paymentRate}%` }}
                  />
                </div>
              </>
            )}
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
            {loading ? (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topMembers.length === 0 || topMembers[0].name === 'Veri yok' ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Katılım verisi henüz yok
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {topMembers.map((member, i) => (
                <div key={member.name} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-green-100 text-[10px] sm:text-xs font-medium text-green-700">
                    {i + 1}
                  </div>
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarFallback className="bg-green-50 text-green-600 text-[10px] sm:text-xs">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
