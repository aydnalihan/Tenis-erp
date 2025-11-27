'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Calendar,
  Users,
  CreditCard,
  ClipboardCheck,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { membersService } from '@/services/members.service';
import type { MemberWithGroup, AttendanceWithLesson, Payment } from '@/types';
import { toast } from 'sonner';

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [member, setMember] = useState<MemberWithGroup | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceWithLesson[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberData();
  }, [id]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      
      // Load member details
      const memberResponse = await membersService.getById(id);
      if (memberResponse.success && memberResponse.data) {
        setMember(memberResponse.data);
      } else {
        toast.error(memberResponse.error || 'Üye bulunamadı');
        return;
      }

      // Load attendance history
      const attendanceResponse = await membersService.getAttendance(id);
      if (attendanceResponse.success && attendanceResponse.data) {
        setAttendanceHistory(attendanceResponse.data as AttendanceWithLesson[]);
      }

      // Load payment history
      const paymentResponse = await membersService.getPayments(id);
      if (paymentResponse.success && paymentResponse.data) {
        setPaymentHistory(paymentResponse.data as Payment[]);
      }
    } catch (error: any) {
      console.error('Error loading member data:', error);
      
      // Check if it's a Supabase configuration error
      if (error?.message?.includes('Supabase yapılandırması eksik')) {
        toast.error(
          'Supabase yapılandırması eksik! Lütfen .env.local dosyanıza NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini ekleyin.',
          { duration: 10000 }
        );
      } else {
        toast.error(error?.message || 'Veriler yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const attendanceRate = attendanceHistory.length > 0
    ? Math.round(
        (attendanceHistory.filter(a => a.status === 'present').length / attendanceHistory.length) * 100
      )
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="space-y-6">
        <Link href="/members">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Üyelere Dön
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-600">Üye bulunamadı</p>
              <p className="text-sm text-gray-400 mt-2">Bu üye silinmiş veya mevcut değil.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/members">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Üyelere Dön
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Düzenle
          </Button>
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            E-posta Gönder
          </Button>
        </div>
      </div>

      {/* Member Header Card */}
      <Card className="bg-white border-green-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-green-100">
                <AvatarFallback className="bg-green-50 text-green-700 text-2xl font-bold">
                  {member.name[0]}{member.surname[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {member.name} {member.surname}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={member.status === 'active' ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-500 border-0'}>
                    {member.status === 'active' ? 'Aktif' : 'Pasif'}
                  </Badge>
                  <Badge className={member.is_child ? 'bg-teal-100 text-teal-700 border-0' : 'bg-blue-100 text-blue-700 border-0'}>
                    {member.is_child ? 'Çocuk' : 'Yetişkin'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {member.group && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {member.group.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Üyelik: {new Date(member.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="md:ml-auto flex flex-col gap-2">
              {member.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${member.email}`} className="hover:underline text-gray-700">
                    {member.email}
                  </a>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${member.phone}`} className="hover:underline text-gray-700">
                    {member.phone}
                  </a>
                </div>
              )}
              {member.birthdate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    Doğum: {new Date(member.birthdate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              )}
              {member.is_child && member.parent_name && (
                <div className="flex items-center gap-2 text-sm mt-2 pt-2 border-t border-gray-200">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    Veli: {member.parent_name}
                    {member.parent_phone && ` (${member.parent_phone})`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Katılım Oranı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{attendanceRate}%</div>
            <p className="text-xs text-gray-400 mt-1">
              {attendanceHistory.length} ders kaydı
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Ödeme Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {paymentHistory.length > 0 && paymentHistory[0].paid ? (
                <Badge className="bg-green-100 text-green-700 border-0">Güncel</Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 border-0">Bekliyor</Badge>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {paymentHistory.length > 0 
                ? paymentHistory[0].paid 
                  ? `${new Date(paymentHistory[0].period + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} aidatı ödendi`
                  : `${new Date(paymentHistory[0].period + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} aidatı bekliyor`
                : 'Ödeme kaydı yok'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Toplam Ders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{attendanceHistory.length}</div>
            <p className="text-xs text-gray-400 mt-1">
              Toplam katılım kaydı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="bg-green-50">
          <TabsTrigger value="attendance" className="gap-2 data-[state=active]:bg-white">
            <ClipboardCheck className="h-4 w-4" />
            Yoklama Geçmişi
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 data-[state=active]:bg-white">
            <CreditCard className="h-4 w-4" />
            Ödeme Geçmişi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card className="bg-white border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Yoklama Geçmişi</CardTitle>
              <CardDescription className="text-gray-500">
                Üyenin ders katılım kayıtları
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceHistory.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Henüz yoklama kaydı yok</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-100">
                      <TableHead className="text-gray-500">Tarih</TableHead>
                      <TableHead className="text-gray-500">Ders</TableHead>
                      <TableHead className="text-gray-500">Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory.map((record) => (
                      <TableRow key={record.id} className="border-green-50">
                        <TableCell>
                          {record.lesson?.date 
                            ? new Date(record.lesson.date).toLocaleDateString('tr-TR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : new Date(record.created_at).toLocaleDateString('tr-TR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                          }
                        </TableCell>
                        <TableCell>
                          {record.lesson 
                            ? `${record.lesson.start_time} - ${record.lesson.end_time}`
                            : 'Bilinmiyor'}
                        </TableCell>
                        <TableCell>
                          {record.status === 'present' ? (
                            <Badge className="bg-green-100 text-green-700 border-0">✓ Katıldı</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-0">✗ Katılmadı</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="bg-white border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Ödeme Geçmişi</CardTitle>
              <CardDescription className="text-gray-500">
                Üyenin aidat ödeme kayıtları
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Henüz ödeme kaydı yok</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-100">
                      <TableHead className="text-gray-500">Dönem</TableHead>
                      <TableHead className="text-gray-500">Tutar</TableHead>
                      <TableHead className="text-gray-500">Durum</TableHead>
                      <TableHead className="text-gray-500">Ödeme Tarihi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id} className="border-green-50">
                        <TableCell className="font-medium">
                          {new Date(payment.period + '-01').toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </TableCell>
                        <TableCell>₺{payment.amount}</TableCell>
                        <TableCell>
                          {payment.paid ? (
                            <Badge className="bg-green-100 text-green-700 border-0">Ödendi</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-0">Ödenmedi</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.paid_at 
                            ? new Date(payment.paid_at).toLocaleDateString('tr-TR')
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
