'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Mail,
  Phone,
  Users,
  Download,
  Trash2,
  Edit,
  Eye,
  UserPlus,
  Filter,
  UserCheck,
  Baby,
  User,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { MemberFormDialog } from '@/components/members/member-form-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { getDemoStore, DemoMember, DemoGroup } from '@/lib/demo-data';
import { MemberFormValues } from '@/lib/validations/member';
import { toast } from 'sonner';

export default function MembersPage() {
  const [members, setMembers] = useState<DemoMember[]>([]);
  const [groups, setGroups] = useState<DemoGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DemoMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<DemoMember | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const store = getDemoStore();
    setMembers(store.getMembers());
    setGroups(store.getGroups());
    setLoading(false);
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.phone?.includes(searchQuery));
      
      const matchesGroup = groupFilter === 'all' || member.group_id === groupFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [members, searchQuery, groupFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    children: members.filter(m => m.is_child).length,
    adults: members.filter(m => !m.is_child).length,
  }), [members]);

  const handleAddMember = () => {
    setEditingMember(null);
    setFormDialogOpen(true);
  };

  const handleEditMember = (member: DemoMember) => {
    setEditingMember(member);
    setFormDialogOpen(true);
  };

  const handleDeleteMember = (member: DemoMember) => {
    setDeletingMember(member);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: MemberFormValues) => {
    setFormLoading(true);
    
    const store = getDemoStore();
    
    if (editingMember) {
      store.updateMember(editingMember.id, {
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        birthdate: data.birthdate || null,
        is_child: data.is_child,
        parent_name: data.parent_name || null,
        parent_phone: data.parent_phone || null,
        group_id: data.group_id || null,
      });
      toast.success('Üye başarıyla güncellendi');
    } else {
      store.addMember({
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        birthdate: data.birthdate || null,
        is_child: data.is_child,
        parent_name: data.parent_name || null,
        parent_phone: data.parent_phone || null,
        group_id: data.group_id || null,
        status: 'active',
      });
      toast.success('Üye başarıyla eklendi');
    }
    
    setMembers(store.getMembers());
    setFormLoading(false);
    setFormDialogOpen(false);
    setEditingMember(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingMember) return;
    
    setFormLoading(true);
    const store = getDemoStore();
    store.deleteMember(deletingMember.id);
    setMembers(store.getMembers());
    toast.success('Üye başarıyla silindi');
    setFormLoading(false);
    setDeleteDialogOpen(false);
    setDeletingMember(null);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return null;
    const group = groups.find(g => g.id === groupId);
    return group?.name || null;
  };

  const getGroupColor = (groupId: string | null) => {
    if (!groupId) return 'bg-gray-400';
    const group = groups.find(g => g.id === groupId);
    return group?.color || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 page-transition">
        <Skeleton className="h-8 sm:h-10 w-32 sm:w-48 bg-green-100" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 sm:h-24 bg-green-50" />)}
        </div>
        <Skeleton className="h-64 sm:h-96 bg-green-50" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 page-transition">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Üyeler</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Tüm kulüp üyelerini yönetin
          </p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white gap-2 btn-shine shadow-lg shadow-green-200 text-sm sm:text-base w-full sm:w-auto"
          onClick={handleAddMember}
        >
          <Plus className="h-4 w-4" />
          Yeni Üye Ekle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border-green-100 shadow-sm card-hover">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500">Toplam Üye</CardTitle>
            <div className="rounded-lg p-1.5 sm:p-2 bg-green-100">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100 shadow-sm card-hover">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500">Aktif Üye</CardTitle>
            <div className="rounded-lg p-1.5 sm:p-2 bg-emerald-100">
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100 shadow-sm card-hover">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500">Çocuk Üye</CardTitle>
            <div className="rounded-lg p-1.5 sm:p-2 bg-teal-100">
              <Baby className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.children}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100 shadow-sm card-hover">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500">Yetişkin Üye</CardTitle>
            <div className="rounded-lg p-1.5 sm:p-2 bg-blue-100">
              <User className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.adults}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-green-100 shadow-sm">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="İsim, email veya telefon ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-11 h-10 sm:h-11 border-green-200 focus:border-green-400 focus:ring-green-200 rounded-xl text-sm"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap gap-2">
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-full xs:w-[140px] sm:w-[150px] h-9 sm:h-10 border-green-200 rounded-lg text-sm">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400" />
                  <SelectValue placeholder="Grup" />
                </SelectTrigger>
                <SelectContent className="border-green-100">
                  <SelectItem value="all">Tüm Gruplar</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full xs:w-[120px] sm:w-[130px] h-9 sm:h-10 border-green-200 rounded-lg text-sm">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent className="border-green-100">
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 border-green-200 hover:bg-green-50 rounded-lg ml-auto">
                <Download className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>

          {selectedMembers.length > 0 && (
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-xs sm:text-sm font-medium text-green-700">
                {selectedMembers.length} üye seçildi
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-100 text-xs h-8">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">E-posta</span>
                </Button>
                <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50 text-xs h-8">
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Sil</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members List - Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {filteredMembers.length === 0 ? (
          <Card className="bg-white border-green-100 shadow-sm">
            <CardContent className="py-12 sm:py-16">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full p-4 bg-green-50">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-300" />
                </div>
                <p className="font-medium text-gray-600 text-sm sm:text-base">Üye bulunamadı</p>
                <p className="text-xs sm:text-sm text-gray-400 max-w-sm">
                  Arama kriterlerinizi değiştirin veya yeni üye ekleyin.
                </p>
                <Button className="mt-2 bg-green-600 hover:bg-green-700 text-sm" onClick={handleAddMember}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Yeni Üye Ekle
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredMembers.map((member) => (
            <Card key={member.id} className="bg-white border-green-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => toggleSelect(member.id)}
                    className="border-green-300 data-[state=checked]:bg-green-600 mt-1"
                  />
                  <Link href={`/members/${member.id}`} className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-green-100 flex-shrink-0">
                        <AvatarFallback className="bg-green-50 text-green-700 text-sm font-medium">
                          {member.name[0]}{member.surname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-800 text-sm">
                            {member.name} {member.surname}
                          </span>
                          {member.status === 'active' ? (
                            <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">Aktif</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500 border-0 text-[10px]">Pasif</Badge>
                          )}
                        </div>
                        
                        {member.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {member.phone}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {getGroupName(member.group_id) && (
                            <div className="flex items-center gap-1">
                              <div className={`h-2 w-2 rounded-full ${getGroupColor(member.group_id)}`} />
                              <span className="text-xs text-gray-600">{getGroupName(member.group_id)}</span>
                            </div>
                          )}
                          <Badge className={`${member.is_child ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'} border-0 text-[10px]`}>
                            {member.is_child ? 'Çocuk' : 'Yetişkin'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-green-700 hover:bg-green-50 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-green-100 w-48">
                      <DropdownMenuLabel className="text-gray-500 text-xs">İşlemler</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-green-100" />
                      <Link href={`/members/${member.id}`}>
                        <DropdownMenuItem className="cursor-pointer text-sm">
                          <Eye className="h-4 w-4 mr-2 text-gray-400" />
                          Detayları Gör
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => handleEditMember(member)} className="cursor-pointer text-sm">
                        <Edit className="h-4 w-4 mr-2 text-gray-400" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-green-100" />
                      <DropdownMenuItem className="text-red-500 hover:bg-red-50 cursor-pointer text-sm" onClick={() => handleDeleteMember(member)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Members Table - Desktop */}
      <Card className="hidden lg:block bg-white border-green-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-green-100 hover:bg-transparent bg-green-50/50">
                <TableHead className="w-12 text-gray-500">
                  <Checkbox
                    checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-green-300 data-[state=checked]:bg-green-600"
                  />
                </TableHead>
                <TableHead className="text-gray-500">Üye</TableHead>
                <TableHead className="text-gray-500">İletişim</TableHead>
                <TableHead className="text-gray-500">Grup</TableHead>
                <TableHead className="text-gray-500">Tür</TableHead>
                <TableHead className="text-gray-500">Durum</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full p-4 bg-green-50">
                        <Users className="h-8 w-8 text-green-300" />
                      </div>
                      <p className="font-medium text-gray-600">Üye bulunamadı</p>
                      <p className="text-sm text-gray-400 max-w-sm">
                        Arama kriterlerinizi değiştirin veya yeni üye ekleyin.
                      </p>
                      <Button className="mt-2 bg-green-600 hover:bg-green-700" onClick={handleAddMember}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Yeni Üye Ekle
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id} className="border-green-50 hover:bg-green-50/50 transition-colors cursor-pointer">
                    <TableCell>
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => toggleSelect(member.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="border-green-300 data-[state=checked]:bg-green-600"
                      />
                    </TableCell>
                    <TableCell>
                      <Link href={`/members/${member.id}`} className="flex items-center gap-3 group">
                        <Avatar className="h-10 w-10 ring-2 ring-green-100">
                          <AvatarFallback className="bg-green-50 text-green-700 text-sm font-medium">
                            {member.name[0]}{member.surname[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-800 group-hover:text-green-700 transition-colors">
                            {member.name} {member.surname}
                          </div>
                          {member.is_child && member.parent_name && (
                            <div className="text-xs text-gray-400">Veli: {member.parent_name}</div>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {member.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate max-w-[180px]">{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getGroupName(member.group_id) ? (
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${getGroupColor(member.group_id)}`} />
                          <span className="text-gray-700">{getGroupName(member.group_id)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${member.is_child ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'} border-0`}>
                        {member.is_child ? 'Çocuk' : 'Yetişkin'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-700 border-0">Aktif</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 border-0">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className="h-8 w-8 text-gray-400 hover:text-green-700 hover:bg-green-50">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-green-100 w-48">
                          <DropdownMenuLabel className="text-gray-500">İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-green-100" />
                          <Link href={`/members/${member.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-2 text-gray-400" />
                              Detayları Gör
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => handleEditMember(member)} className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2 text-gray-400" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            E-posta Gönder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-green-100" />
                          <DropdownMenuItem className="text-red-500 hover:bg-red-50 cursor-pointer" onClick={() => handleDeleteMember(member)}>
                            <Trash2 className="h-4 w-4 mr-2" />
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

      <MemberFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        member={editingMember ? { ...editingMember, updated_at: editingMember.updated_at } : null}
        groups={groups.map(g => ({ id: g.id, name: g.name, description: g.description, coach_id: g.coach_id, created_at: g.created_at, updated_at: g.updated_at }))}
        loading={formLoading}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Üyeyi Sil"
        description={`"${deletingMember?.name} ${deletingMember?.surname}" isimli üyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        variant="destructive"
        loading={formLoading}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
