'use client';

import { useState, useEffect } from 'react';
import { lessonsService } from '@/services/lessons.service';
import { membersService } from '@/services/members.service';
import { paymentsService } from '@/services/payments.service';
import { groupsService } from '@/services/groups.service';
import { attendanceService } from '@/services/attendance.service';
import { toast } from 'sonner';
import { 
  Download,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ReportsPage() {
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalAttendance: 0,
    possibleAttendance: 0,
    attendanceRate: 0,
    newMembers: 0,
    totalRevenue: 0,
    collectedRevenue: 0,
  });
  const [topAbsentees, setTopAbsentees] = useState<Array<{ name: string; group: string; absences: number; rate: number }>>([]);
  const [overduePayments, setOverduePayments] = useState<Array<{ name: string; group: string; amount: number; days: number }>>([]);
  const [groupDistribution, setGroupDistribution] = useState<Array<{ name: string; members: number; percentage: number }>>([]);

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Parse period
      const [year, month] = period.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      // Load lessons
      const lessonsResponse = await lessonsService.getByDateRange(startDate, endDate);
      const lessons = lessonsResponse.success && lessonsResponse.data ? lessonsResponse.data : [];
      const completedLessons = lessons.filter(l => l.status === 'completed');
      
      // Load members
      const membersResponse = await membersService.getAll({ pageSize: 1000 });
      const allMembers = membersResponse.data || [];
      const newMembers = allMembers.filter(m => {
        const created = new Date(m.created_at);
        return created >= new Date(startDate) && created <= new Date(endDate);
      });
      
      // Load payments
      const paymentsResponse = await paymentsService.getAll({ period, pageSize: 1000 });
      const payments = paymentsResponse.success && paymentsResponse.data ? paymentsResponse.data : [];
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const collectedRevenue = payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
      
      // Load overdue payments
      const overdueResponse = await paymentsService.getOverdue();
      const overdue = overdueResponse.success && overdueResponse.data ? overdueResponse.data : [];
      const overdueList = overdue.slice(0, 5).map((p: any) => {
        const periodDate = new Date(p.period + '-01');
        const days = Math.floor((Date.now() - periodDate.getTime()) / (1000 * 60 * 60 * 24));
        return {
          name: p.member ? `${p.member.name} ${p.member.surname}` : 'Bilinmiyor',
          group: p.member?.group?.name || 'Grup Yok',
          amount: p.amount,
          days,
        };
      });
      setOverduePayments(overdueList);
      
      // Load groups for distribution
      const groupsResponse = await groupsService.getAll({ pageSize: 1000 });
      const groups = groupsResponse.data || [];
      const totalMembersWithGroup = allMembers.filter(m => m.group_id).length;
      const distribution = groups.map(g => {
        const memberCount = allMembers.filter(m => m.group_id === g.id).length;
        return {
          name: g.name,
          members: memberCount,
          percentage: totalMembersWithGroup > 0 ? Math.round((memberCount / totalMembersWithGroup) * 100) : 0,
        };
      });
      setGroupDistribution(distribution);
      
      // Calculate attendance stats (simplified - would need more complex query in production)
      const totalAttendance = completedLessons.length * 10; // Estimate
      const possibleAttendance = lessons.length * 10; // Estimate
      const attendanceRate = possibleAttendance > 0 ? Math.round((totalAttendance / possibleAttendance) * 100) : 0;
      
      setMonthlyStats({
        totalLessons: lessons.length,
        completedLessons: completedLessons.length,
        totalAttendance,
        possibleAttendance,
        attendanceRate,
        newMembers: newMembers.length,
        totalRevenue,
        collectedRevenue,
      });
      
      // TODO: Calculate top absentees (would need attendance aggregation)
      setTopAbsentees([]);
      
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast.error(error?.message || 'Raporlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 page-transition">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Kulüp performans ve istatistiklerini inceleyin
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full xs:w-[150px] sm:w-[160px] border-green-200 focus:ring-green-200 text-sm h-9 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-green-100">
              {(() => {
                const now = new Date();
                const options = [];
                for (let i = 0; i < 6; i++) {
                  const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  const label = date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
                  options.push(<SelectItem key={value} value={value}>{label}</SelectItem>);
                }
                return options;
              })()}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="flex-1 xs:flex-none gap-1 sm:gap-2 border-green-200 text-green-700 hover:bg-green-50 text-xs sm:text-sm h-9 sm:h-10">
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">PDF</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 xs:flex-none gap-1 sm:gap-2 border-green-200 text-green-700 hover:bg-green-50 text-xs sm:text-sm h-9 sm:h-10">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">CSV</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Toplam Ders"
          value={monthlyStats.totalLessons}
          subtitle={`${monthlyStats.completedLessons} tamamlandı`}
          icon={Calendar}
          index={0}
        />
        <StatsCard
          title="Katılım Oranı"
          value={`%${monthlyStats.attendanceRate}`}
          subtitle={`${monthlyStats.totalAttendance}/${monthlyStats.possibleAttendance}`}
          icon={TrendingUp}
          index={1}
        />
        <StatsCard
          title="Yeni Üye"
          value={`+${monthlyStats.newMembers}`}
          subtitle="Bu ay"
          icon={Users}
          index={2}
        />
        <StatsCard
          title="Tahsilat"
          value={`%${Math.round((monthlyStats.collectedRevenue / monthlyStats.totalRevenue) * 100)}`}
          subtitle={`₺${(monthlyStats.collectedRevenue / 1000).toFixed(0)}K / ₺${(monthlyStats.totalRevenue / 1000).toFixed(0)}K`}
          icon={CreditCard}
          index={3}
        />
      </div>

      {/* Tabs for detailed reports */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="w-full sm:w-auto flex sm:inline-flex bg-green-50 p-1 gap-1 h-auto">
          <TabsTrigger value="attendance" className="flex-1 sm:flex-none gap-1 sm:gap-2 text-xs sm:text-sm py-2 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Devamsızlık</span>
            <span className="xs:hidden">Dev.</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-1 sm:flex-none gap-1 sm:gap-2 text-xs sm:text-sm py-2 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm">
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Ödemeler</span>
            <span className="xs:hidden">Öd.</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1 sm:flex-none gap-1 sm:gap-2 text-xs sm:text-sm py-2 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm">
            <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Gruplar</span>
            <span className="xs:hidden">Gr.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-white border-green-100 shadow-sm">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-gray-900">En Çok Devamsızlık</CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  Bu ay en çok ders kaçıran üyeler
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {/* Mobile List */}
                <div className="space-y-3 lg:hidden">
                  {topAbsentees.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                      Devamsızlık verileri yakında eklenecek
                    </div>
                  ) : (
                    topAbsentees.slice(0, 4).map((member, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-700 text-sm truncate">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.group}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-red-500 text-sm font-medium">{member.absences}</span>
                          <Badge className={member.rate >= 80 ? 'bg-green-100 text-green-700 border-0 text-[10px]' : 'bg-amber-100 text-amber-700 border-0 text-[10px]'}>
                            %{member.rate}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-green-100 hover:bg-transparent">
                        <TableHead className="text-gray-500 text-xs sm:text-sm">Üye</TableHead>
                        <TableHead className="text-gray-500 text-xs sm:text-sm">Grup</TableHead>
                        <TableHead className="text-center text-gray-500 text-xs sm:text-sm">Dev.</TableHead>
                        <TableHead className="text-center text-gray-500 text-xs sm:text-sm">Katılım</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topAbsentees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-400 text-sm py-8">
                            Devamsızlık verileri yakında eklenecek
                          </TableCell>
                        </TableRow>
                      ) : (
                        topAbsentees.map((member, i) => (
                          <TableRow key={i} className="border-green-50 hover:bg-green-50/50">
                            <TableCell className="font-medium text-gray-700 text-sm">{member.name}</TableCell>
                            <TableCell className="text-gray-600 text-sm">{member.group}</TableCell>
                            <TableCell className="text-center text-red-500 font-medium text-sm">{member.absences}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={member.rate >= 80 ? 'bg-green-100 text-green-700 border-0 text-xs' : 'bg-amber-100 text-amber-700 border-0 text-xs'}>
                                %{member.rate}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100 shadow-sm">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-gray-900">Haftalık Katılım</CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  Son 4 haftanın trendi
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { week: 'Hafta 1', rate: 92 },
                    { week: 'Hafta 2', rate: 88 },
                    { week: 'Hafta 3', rate: 85 },
                    { week: 'Hafta 4', rate: 79 },
                  ].map((w, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span className="text-gray-600">{w.week}</span>
                        <span className="font-medium text-gray-700">%{w.rate}</span>
                      </div>
                      <div className="h-2 sm:h-3 rounded-full bg-green-100 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                          style={{ width: `${w.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-white border-green-100 shadow-sm">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-gray-900">Geciken Ödemeler</CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  Vadesi geçmiş aidatlar
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {/* Mobile List */}
                <div className="space-y-3 lg:hidden">
                  {overduePayments.map((payment, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-700 text-sm truncate">{payment.name}</p>
                        <p className="text-xs text-gray-400">{payment.group}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-700 text-sm font-medium">₺{payment.amount}</span>
                        <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">
                          {payment.days}g
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-green-100 hover:bg-transparent">
                        <TableHead className="text-gray-500 text-sm">Üye</TableHead>
                        <TableHead className="text-gray-500 text-sm">Grup</TableHead>
                        <TableHead className="text-right text-gray-500 text-sm">Tutar</TableHead>
                        <TableHead className="text-center text-gray-500 text-sm">Gecikme</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overduePayments.map((payment, i) => (
                        <TableRow key={i} className="border-green-50 hover:bg-green-50/50">
                          <TableCell className="font-medium text-gray-700">{payment.name}</TableCell>
                          <TableCell className="text-gray-600">{payment.group}</TableCell>
                          <TableCell className="text-right text-gray-700">₺{payment.amount}</TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-red-100 text-red-700 border-0">
                              {payment.days} gün
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100 shadow-sm">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-gray-900">Ödeme Özeti</CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  Aylık tahsilat durumu
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-gray-600">Tahsilat Oranı</span>
                    <span className="font-medium text-gray-700">
                      %{Math.round((monthlyStats.collectedRevenue / monthlyStats.totalRevenue) * 100)}
                    </span>
                  </div>
                  <div className="h-3 sm:h-4 rounded-full bg-green-100 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                      style={{ width: `${(monthlyStats.collectedRevenue / monthlyStats.totalRevenue) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-green-50 border border-green-200">
                    <p className="text-xs sm:text-sm text-green-600">Tahsil Edilen</p>
                    <p className="text-base sm:text-xl font-bold text-green-700">
                      ₺{monthlyStats.collectedRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs sm:text-sm text-amber-600">Bekleyen</p>
                    <p className="text-base sm:text-xl font-bold text-amber-700">
                      ₺{(monthlyStats.totalRevenue - monthlyStats.collectedRevenue).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-white border-green-100 shadow-sm">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-gray-900">Grup Dağılımı</CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  Üyelerin gruplara göre dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {groupDistribution.map((group, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span className="text-gray-600 truncate">{group.name}</span>
                        <span className="font-medium text-gray-700 flex-shrink-0 ml-2">{group.members} (%{group.percentage})</span>
                      </div>
                      <div className="h-2 sm:h-3 rounded-full bg-green-100 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                          style={{ width: `${group.percentage * 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100 shadow-sm">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-gray-900">Grup Performansı</CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  Katılım ve ödeme durumu
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {/* Mobile List */}
                <div className="space-y-3 lg:hidden">
                  {[
                    { name: 'Yetişkinler A', attendance: 92, payment: 100 },
                    { name: 'Yetişkinler B', attendance: 85, payment: 90 },
                    { name: 'Gençler B', attendance: 78, payment: 75 },
                    { name: 'Yıldızlar', attendance: 88, payment: 85 },
                    { name: 'Minikler', attendance: 90, payment: 95 },
                  ].map((group, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="font-medium text-gray-700 text-sm truncate">{group.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={group.attendance >= 85 ? 'bg-green-100 text-green-700 border-0 text-[10px]' : 'bg-amber-100 text-amber-700 border-0 text-[10px]'}>
                          %{group.attendance}
                        </Badge>
                        <Badge className={group.payment >= 90 ? 'bg-green-100 text-green-700 border-0 text-[10px]' : 'bg-amber-100 text-amber-700 border-0 text-[10px]'}>
                          %{group.payment}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-green-100 hover:bg-transparent">
                        <TableHead className="text-gray-500 text-sm">Grup</TableHead>
                        <TableHead className="text-center text-gray-500 text-sm">Katılım</TableHead>
                        <TableHead className="text-center text-gray-500 text-sm">Ödeme</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: 'Yetişkinler A', attendance: 92, payment: 100 },
                        { name: 'Yetişkinler B', attendance: 85, payment: 90 },
                        { name: 'Gençler B', attendance: 78, payment: 75 },
                        { name: 'Yıldızlar', attendance: 88, payment: 85 },
                        { name: 'Minikler', attendance: 90, payment: 95 },
                      ].map((group, i) => (
                        <TableRow key={i} className="border-green-50 hover:bg-green-50/50">
                          <TableCell className="font-medium text-gray-700">{group.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={group.attendance >= 85 ? 'bg-green-100 text-green-700 border-0' : 'bg-amber-100 text-amber-700 border-0'}>
                              %{group.attendance}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={group.payment >= 90 ? 'bg-green-100 text-green-700 border-0' : 'bg-amber-100 text-amber-700 border-0'}>
                              %{group.payment}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
