'use client';

import { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const monthlyStats = {
  totalLessons: 48,
  completedLessons: 36,
  totalAttendance: 432,
  possibleAttendance: 504,
  attendanceRate: 86,
  newMembers: 5,
  totalRevenue: 92500,
  collectedRevenue: 72150,
};

const topAbsentees = [
  { name: 'Emre Çelik', group: 'Yetişkinler A', absences: 4, rate: 67 },
  { name: 'Murat Kaya', group: 'Yetişkinler A', absences: 3, rate: 75 },
  { name: 'Ayşe Yıldız', group: 'Gençler B', absences: 3, rate: 75 },
  { name: 'Can Demir', group: 'Yıldızlar', absences: 2, rate: 83 },
  { name: 'Elif Kaya', group: 'Gençler B', absences: 2, rate: 83 },
];

const overduePayments = [
  { name: 'Can Demir', group: 'Yıldızlar', amount: 700, days: 12 },
  { name: 'Ayşe Yıldız', group: 'Gençler B', amount: 650, days: 10 },
  { name: 'Elif Kaya', group: 'Gençler B', amount: 650, days: 8 },
  { name: 'Selin Demir', group: 'Yetişkinler A', amount: 750, days: 5 },
];

const groupDistribution = [
  { name: 'Yetişkinler A', members: 12, percentage: 20 },
  { name: 'Yetişkinler B', members: 10, percentage: 17 },
  { name: 'Gençler B', members: 8, percentage: 13 },
  { name: 'Yıldızlar', members: 10, percentage: 17 },
  { name: 'Minikler', members: 15, percentage: 25 },
  { name: 'Diğer', members: 5, percentage: 8 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState('2024-11');

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
              <SelectItem value="2024-11">Kasım 2024</SelectItem>
              <SelectItem value="2024-10">Ekim 2024</SelectItem>
              <SelectItem value="2024-09">Eylül 2024</SelectItem>
              <SelectItem value="2024-q4">Q4 2024</SelectItem>
              <SelectItem value="2024">2024 Yılı</SelectItem>
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
        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="truncate">Toplam Ders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{monthlyStats.totalLessons}</div>
            <p className="text-[10px] sm:text-xs text-gray-400">{monthlyStats.completedLessons} tamamlandı</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="truncate">Katılım Oranı</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">%{monthlyStats.attendanceRate}</div>
            <p className="text-[10px] sm:text-xs text-gray-400">{monthlyStats.totalAttendance}/{monthlyStats.possibleAttendance}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="truncate">Yeni Üye</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600">+{monthlyStats.newMembers}</div>
            <p className="text-[10px] sm:text-xs text-gray-400">Bu ay</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-2">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="truncate">Tahsilat</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              %{Math.round((monthlyStats.collectedRevenue / monthlyStats.totalRevenue) * 100)}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate">
              ₺{(monthlyStats.collectedRevenue / 1000).toFixed(0)}K / ₺{(monthlyStats.totalRevenue / 1000).toFixed(0)}K
            </p>
          </CardContent>
        </Card>
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
                  {topAbsentees.slice(0, 4).map((member, i) => (
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
                  ))}
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
                      {topAbsentees.map((member, i) => (
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
                      ))}
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
