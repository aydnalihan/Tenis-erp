'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Check,
  X,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  Mail,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { paymentsService } from '@/services/payments.service';
import { membersService } from '@/services/members.service';
import { StatsCard } from '@/components/shared';
import type { PaymentWithMember, MemberWithGroup } from '@/types';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithMember[]>([]);
  const [members, setMembers] = useState<MemberWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filter, setFilter] = useState('all');
  
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [addPeriodOpen, setAddPeriodOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('750');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load payments for selected period
      const paymentsResponse = await paymentsService.getAll({
        period: selectedPeriod,
        pageSize: 1000,
      });
      
      if (paymentsResponse.success && paymentsResponse.data) {
        // Calculate overdue status for each payment
        const currentDate = new Date();
        const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const paymentsWithOverdue = paymentsResponse.data.map(payment => ({
          ...payment,
          overdue: !payment.paid && payment.period < currentPeriod,
        }));
        setPayments(paymentsWithOverdue);
      } else {
        setPayments([]);
      }
      
      // Load members for add payment dialog
      const membersResponse = await membersService.getAll({
        pageSize: 1000,
        status: 'active',
      });
      setMembers(membersResponse.data || []);
    } catch (error: any) {
      console.error('Error loading payments:', error);
      toast.error(error?.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = totalAmount - paidAmount;
  const currentDate = new Date();
  const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const overdueCount = payments.filter(p => !p.paid && p.period < currentPeriod).length;

  const filteredPayments = payments.filter(p => {
    const memberName = p.member ? `${p.member.name} ${p.member.surname}` : '';
    const matchesSearch = memberName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPeriod = p.period === selectedPeriod;
    
    // Check if overdue (not paid and period is in the past)
    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const isOverdue = !p.paid && p.period < currentPeriod;
    
    if (filter === 'paid') return matchesSearch && matchesPeriod && p.paid;
    if (filter === 'pending') return matchesSearch && matchesPeriod && !p.paid;
    if (filter === 'overdue') return matchesSearch && matchesPeriod && isOverdue;
    return matchesSearch && matchesPeriod;
  });

  const handleMarkPaid = async (paymentId: string) => {
    try {
      const response = await paymentsService.markAsPaid(paymentId);
      if (response.success) {
        toast.success('Ödeme başarıyla kaydedildi');
        await loadData();
      } else {
        toast.error(response.error || 'Ödeme kaydedilemedi');
      }
    } catch (error: any) {
      console.error('Error marking payment as paid:', error);
      toast.error(error?.message || 'Bir hata oluştu');
    }
  };

  const handleAddPayment = async () => {
    if (!selectedMember) {
      toast.error('Lütfen bir üye seçin');
      return;
    }
    
    setFormLoading(true);
    
    try {
      const response = await paymentsService.create({
        member_id: selectedMember,
        period: selectedPeriod,
        amount: parseFloat(paymentAmount),
        paid: true,
      });
      
      if (response.success) {
        toast.success('Ödeme başarıyla eklendi');
        await loadData();
        setAddPaymentOpen(false);
        setSelectedMember('');
        setPaymentAmount('750');
      } else {
        toast.error(response.error || 'Ödeme eklenemedi');
      }
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast.error(error?.message || 'Bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreatePeriod = async () => {
    setFormLoading(true);
    
    try {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const period = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
      
      const response = await paymentsService.generatePeriod(period, parseFloat(paymentAmount));
      
      if (response.success) {
        toast.success(`${period} dönemi oluşturuldu`);
        setSelectedPeriod(period);
        await loadData();
        setAddPeriodOpen(false);
      } else {
        toast.error(response.error || 'Dönem oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Error creating period:', error);
      toast.error(error?.message || 'Bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 page-transition">
        <div className="h-8 sm:h-10 w-32 sm:w-48 bg-green-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 sm:h-24 bg-green-50 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 sm:h-96 bg-green-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 page-transition">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ödemeler</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Aidat ödemelerini takip edin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none gap-2 border-green-200 text-green-700 hover:bg-green-50 text-sm"
            onClick={() => setAddPeriodOpen(true)}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden xs:inline">Dönem Oluştur</span>
            <span className="xs:hidden">Dönem</span>
          </Button>
          <Button 
            className="flex-1 sm:flex-none gap-2 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 text-sm"
            onClick={() => setAddPaymentOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">Ödeme Ekle</span>
            <span className="xs:hidden">Ekle</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Toplam Beklenen"
          value={`₺${totalAmount.toLocaleString()}`}
          subtitle="Kasım 2024"
          icon={CreditCard}
          index={0}
        />
        <StatsCard
          title="Tahsil Edilen"
          value={`₺${paidAmount.toLocaleString()}`}
          subtitle={`${payments.filter(p => p.paid).length} ödeme`}
          icon={Check}
          index={1}
        />
        <StatsCard
          title="Bekleyen"
          value={`₺${pendingAmount.toLocaleString()}`}
          subtitle={`${payments.filter(p => !p.paid).length} üye`}
          icon={TrendingUp}
          index={2}
        />
        <StatsCard
          title="Gecikmiş"
          value={overdueCount}
          subtitle="üye"
          icon={AlertCircle}
          index={3}
        />
      </div>

      {/* Progress Bar */}
      <Card className="bg-white border-green-100 shadow-sm">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Tahsilat Durumu</span>
            <span className="text-xs sm:text-sm text-green-600 font-medium">
              {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 sm:h-3 rounded-full bg-green-100 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
              style={{ width: `${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-gray-500">
            <span>₺{paidAmount.toLocaleString()} tahsil edildi</span>
            <span>₺{pendingAmount.toLocaleString()} bekliyor</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white border-green-100 shadow-sm">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Üye ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-11 h-10 sm:h-11 border-green-200 focus:border-green-400 focus:ring-green-200 rounded-xl text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="flex-1 xs:flex-none xs:w-[140px] sm:w-[160px] h-9 sm:h-10 border-green-200 rounded-lg text-sm">
                  <SelectValue placeholder="Dönem seç" />
                </SelectTrigger>
                <SelectContent className="border-green-100">
                  <SelectItem value="2024-12">Aralık 2024</SelectItem>
                  <SelectItem value="2024-11">Kasım 2024</SelectItem>
                  <SelectItem value="2024-10">Ekim 2024</SelectItem>
                  <SelectItem value="2024-09">Eylül 2024</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="flex-1 xs:flex-none xs:w-[120px] sm:w-[130px] h-9 sm:h-10 border-green-200 rounded-lg text-sm">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent className="border-green-100">
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="paid">Ödenenler</SelectItem>
                  <SelectItem value="pending">Bekleyenler</SelectItem>
                  <SelectItem value="overdue">Gecikmişler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List - Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {filteredPayments.length === 0 ? (
          <Card className="bg-white border-green-100 shadow-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-2 text-center">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                <p className="font-medium text-gray-600 text-sm">Ödeme bulunamadı</p>
                <p className="text-xs text-gray-400">Bu dönem için ödeme kaydı yok.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className="bg-white border-green-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 ring-2 ring-green-100 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-green-50 text-green-700">
                        {payment.member ? `${payment.member.name?.[0] || ''}${payment.member.surname?.[0] || ''}` : '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="font-medium text-gray-800 text-sm block truncate">
                        {payment.member ? `${payment.member.name} ${payment.member.surname}` : 'Bilinmiyor'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {payment.member?.group?.name || 'Grup Yok'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-semibold text-gray-800 text-sm">₺{payment.amount}</p>
                    {payment.paid ? (
                      <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                        <Check className="h-3 w-3 mr-0.5" />
                        Ödendi
                      </Badge>
                    ) : payment.overdue ? (
                      <Badge className="bg-red-100 text-red-600 border-0 text-[10px]">
                        <AlertCircle className="h-3 w-3 mr-0.5" />
                        Gecikmiş
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">
                        <X className="h-3 w-3 mr-0.5" />
                        Bekliyor
                      </Badge>
                    )}
                  </div>
                </div>
                {!payment.paid && (
                  <div className="mt-3 pt-3 border-t border-green-100">
                    <Button 
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700 text-xs h-8"
                      onClick={() => handleMarkPaid(payment.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Ödendi İşaretle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payments Table - Desktop */}
      <Card className="hidden lg:block bg-white border-green-100 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-gray-900">Ödeme Listesi</CardTitle>
          <CardDescription className="text-gray-500">
            {selectedPeriod === '2024-11' ? 'Kasım' : selectedPeriod === '2024-12' ? 'Aralık' : selectedPeriod} 2024 dönemi aidat ödemeleri
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-green-100 hover:bg-transparent">
                <TableHead className="w-12 text-gray-500">
                  <Checkbox className="border-green-300 data-[state=checked]:bg-green-600" />
                </TableHead>
                <TableHead className="text-gray-500">Üye</TableHead>
                <TableHead className="text-gray-500">Grup</TableHead>
                <TableHead className="text-right text-gray-500">Tutar</TableHead>
                <TableHead className="text-gray-500">Durum</TableHead>
                <TableHead className="text-gray-500">Ödeme Tarihi</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="h-8 w-8 text-gray-300" />
                      <p className="font-medium text-gray-600">Ödeme bulunamadı</p>
                      <p className="text-sm text-gray-400">Bu dönem için ödeme kaydı yok.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-green-50 hover:bg-green-50/50">
                    <TableCell>
                      <Checkbox className="border-green-300 data-[state=checked]:bg-green-600" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-green-100">
                          <AvatarFallback className="text-xs bg-green-50 text-green-700">
                            {payment.member ? `${payment.member.name?.[0] || ''}${payment.member.surname?.[0] || ''}` : '??'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-800">
                          {payment.member ? `${payment.member.name} ${payment.member.surname}` : 'Bilinmiyor'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{payment.member?.group?.name || 'Grup Yok'}</TableCell>
                    <TableCell className="text-right font-semibold text-gray-800">₺{payment.amount}</TableCell>
                    <TableCell>
                      {payment.paid ? (
                        <Badge className="bg-green-100 text-green-700 border-0">
                          <Check className="h-3 w-3 mr-1" />
                          Ödendi
                        </Badge>
                      ) : payment.overdue ? (
                        <Badge className="bg-red-100 text-red-600 border-0">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Gecikmiş
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-0">
                          <X className="h-3 w-3 mr-1" />
                          Bekliyor
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('tr-TR') : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-green-700 hover:bg-green-50">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-green-100">
                          {!payment.paid && (
                            <DropdownMenuItem onClick={() => handleMarkPaid(payment.id)} className="text-green-700 hover:bg-green-50 cursor-pointer">
                              <Check className="h-4 w-4 mr-2" />
                              Ödendi İşaretle
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="cursor-pointer">
                            <Mail className="h-4 w-4 mr-2" />
                            Hatırlatma Gönder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-green-100" />
                          <DropdownMenuItem className="text-red-500 hover:bg-red-50 cursor-pointer">
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
        <DialogContent className="sm:max-w-[425px] border-green-100 mx-4">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Ödeme Ekle</DialogTitle>
            <DialogDescription className="text-gray-500">
              Yeni bir ödeme kaydı oluşturun.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member" className="text-gray-700 text-sm">Üye</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="border-green-200 focus:ring-green-200">
                  <SelectValue placeholder="Üye seçin" />
                </SelectTrigger>
                <SelectContent className="border-green-100 max-h-[200px]">
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} {member.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-gray-700 text-sm">Tutar (₺)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="border-green-200 focus:border-green-400 focus:ring-green-200"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddPaymentOpen(false)} className="border-green-200 text-gray-600 hover:bg-green-50">
              İptal
            </Button>
            <Button onClick={handleAddPayment} disabled={formLoading} className="bg-green-600 hover:bg-green-700">
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Period Dialog */}
      <Dialog open={addPeriodOpen} onOpenChange={setAddPeriodOpen}>
        <DialogContent className="sm:max-w-[425px] border-green-100 mx-4">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Yeni Dönem Oluştur</DialogTitle>
            <DialogDescription className="text-gray-500">
              Tüm üyeler için yeni bir ödeme dönemi oluşturun.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-sm sm:text-base">Aralık 2024</p>
                  <p className="text-xs sm:text-sm text-green-600">{members.length} üye için ödeme kaydı oluşturulacak</p>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Bu işlem tüm aktif üyeler için varsayılan aidat tutarıyla ödeme kaydı oluşturacaktır.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddPeriodOpen(false)} className="border-green-200 text-gray-600 hover:bg-green-50">
              İptal
            </Button>
            <Button onClick={handleCreatePeriod} disabled={formLoading} className="bg-green-600 hover:bg-green-700">
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Dönem Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
