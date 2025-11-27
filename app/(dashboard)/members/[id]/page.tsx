'use client';

import { use } from 'react';
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
  MoreHorizontal
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

// Demo data
const member = {
  id: '1',
  name: 'Ahmet',
  surname: 'Yılmaz',
  email: 'ahmet@email.com',
  phone: '0532 123 4567',
  birthdate: '1990-05-15',
  is_child: false,
  group: {
    id: '1',
    name: 'Yetişkinler A',
  },
  created_at: '2023-01-15',
  status: 'active',
};

const paymentHistory = [
  { id: '1', period: '2024-11', amount: 750, paid: true, paid_at: '2024-11-05' },
  { id: '2', period: '2024-10', amount: 750, paid: true, paid_at: '2024-10-03' },
  { id: '3', period: '2024-09', amount: 750, paid: true, paid_at: '2024-09-02' },
  { id: '4', period: '2024-08', amount: 750, paid: true, paid_at: '2024-08-05' },
];

const attendanceHistory = [
  { id: '1', date: '2024-11-25', status: 'present', lesson: 'Pazartesi Dersi' },
  { id: '2', date: '2024-11-22', status: 'present', lesson: 'Cuma Dersi' },
  { id: '3', date: '2024-11-20', status: 'absent', lesson: 'Çarşamba Dersi' },
  { id: '4', date: '2024-11-18', status: 'present', lesson: 'Pazartesi Dersi' },
  { id: '5', date: '2024-11-15', status: 'present', lesson: 'Cuma Dersi' },
];

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const attendanceRate = Math.round(
    (attendanceHistory.filter(a => a.status === 'present').length / attendanceHistory.length) * 100
  );

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
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {member.name[0]}{member.surname[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {member.name} {member.surname}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    Aktif
                  </Badge>
                  <Badge variant="secondary">Yetişkin</Badge>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {member.group.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Üyelik: {new Date(member.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="md:ml-auto flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${member.email}`} className="hover:underline">
                  {member.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${member.phone}`} className="hover:underline">
                  {member.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Doğum: {new Date(member.birthdate).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Katılım Oranı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Son 5 ders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Ödeme Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700">Güncel</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kasım aidatı ödendi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Toplam Ders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bu yıl katılım
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Yoklama Geçmişi
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Ödeme Geçmişi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Yoklama Geçmişi</CardTitle>
              <CardDescription>
                Üyenin ders katılım kayıtları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Ders</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{record.lesson}</TableCell>
                      <TableCell>
                        {record.status === 'present' ? (
                          <Badge className="bg-green-100 text-green-700">✓ Katıldı</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">✗ Katılmadı</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Geçmişi</CardTitle>
              <CardDescription>
                Üyenin aidat ödeme kayıtları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dönem</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Ödeme Tarihi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {new Date(payment.period + '-01').toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </TableCell>
                      <TableCell>₺{payment.amount}</TableCell>
                      <TableCell>
                        {payment.paid ? (
                          <Badge className="bg-green-100 text-green-700">Ödendi</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">Ödenmedi</Badge>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

