'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Users,
  Calendar,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GroupFormDialog } from '@/components/groups/group-form-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { groupsService } from '@/services/groups.service';
import { membersService } from '@/services/members.service';
import type { Group, GroupWithMembers, MemberWithGroup } from '@/types';
import { GroupFormValues } from '@/lib/validations/group';
import { toast } from 'sonner';

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [members, setMembers] = useState<MemberWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupWithMembers | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<GroupWithMembers | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load groups
      const groupsResponse = await groupsService.getAll({
        pageSize: 1000,
      });
      setGroups(groupsResponse.data || []);
      
      // Load members to count
      const membersResponse = await membersService.getAll({
        pageSize: 1000,
      });
      setMembers(membersResponse.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error?.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getMemberCount = (groupId: string) => {
    // Count members for this group from the members array
    return members.filter(m => m.group_id === groupId).length;
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  const totalMembers = members.filter(m => m.group_id).length;

  const handleAddGroup = () => {
    setEditingGroup(null);
    setFormDialogOpen(true);
  };

  const handleEditGroup = (group: GroupWithMembers) => {
    setEditingGroup(group);
    setFormDialogOpen(true);
  };

  const handleDeleteGroup = (group: GroupWithMembers) => {
    setDeletingGroup(group);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: GroupFormValues) => {
    setFormLoading(true);
    
    try {
      if (editingGroup) {
        const response = await groupsService.update(editingGroup.id, {
          name: data.name,
          description: data.description || undefined,
          coach_id: data.coach_id || undefined,
        });
        
        if (response.success) {
          toast.success('Grup başarıyla güncellendi');
          await loadData();
        } else {
          toast.error(response.error || 'Güncelleme başarısız');
        }
      } else {
        const response = await groupsService.create({
          name: data.name,
          description: data.description || undefined,
          coach_id: data.coach_id || undefined,
        });
        
        if (response.success) {
          toast.success('Grup başarıyla oluşturuldu');
          await loadData();
        } else {
          toast.error(response.error || 'Oluşturma başarısız');
        }
      }
      
      setFormDialogOpen(false);
      setEditingGroup(null);
    } catch (error: any) {
      console.error('Error saving group:', error);
      toast.error(error?.message || 'Bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingGroup) return;
    
    setFormLoading(true);
    try {
      const response = await groupsService.delete(deletingGroup.id);
      
      if (response.success) {
        toast.success('Grup başarıyla silindi');
        await loadData();
      } else {
        toast.error(response.error || 'Silme başarısız');
      }
      
      setDeleteDialogOpen(false);
      setDeletingGroup(null);
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast.error(error?.message || 'Bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 page-transition">
        <Skeleton className="h-8 sm:h-10 w-32 sm:w-48 bg-green-100" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 sm:h-24 bg-green-50" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 sm:h-48 bg-green-50" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 page-transition">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gruplar</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Tenis gruplarını yönetin ve organize edin
          </p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white gap-2 btn-shine shadow-lg shadow-green-200 text-sm sm:text-base w-full sm:w-auto"
          onClick={handleAddGroup}
        >
          <Plus className="h-4 w-4" />
          Yeni Grup Oluştur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-white border-green-100 shadow-sm card-hover">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500">Toplam Grup</CardTitle>
            <div className="rounded-lg p-1.5 sm:p-2 bg-green-100 hidden xs:flex">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{groups.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100 shadow-sm card-hover">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500">Toplam Öğrenci</CardTitle>
            <div className="rounded-lg p-1.5 sm:p-2 bg-emerald-100 hidden xs:flex">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600">{totalMembers}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100 shadow-sm card-hover">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500">Ort. Büyüklük</CardTitle>
            <div className="rounded-lg p-1.5 sm:p-2 bg-teal-100 hidden xs:flex">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {groups.length > 0 ? Math.round(totalMembers / groups.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Grup ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 sm:pl-11 h-10 sm:h-11 border-green-200 focus:border-green-400 focus:ring-green-200 rounded-xl bg-white text-sm sm:text-base"
        />
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <Card className="bg-white border-green-100 shadow-sm">
          <CardContent className="py-12 sm:py-16">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full p-4 bg-green-50">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-300" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700">Grup bulunamadı</h3>
              <p className="text-xs sm:text-sm text-gray-400 max-w-sm">
                {searchQuery 
                  ? 'Arama kriterlerinizi değiştirin veya yeni grup oluşturun.'
                  : 'Henüz grup oluşturulmamış. İlk grubunuzu oluşturun.'}
              </p>
              <Button className="mt-3 bg-green-600 hover:bg-green-700 text-sm" onClick={handleAddGroup}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Grup Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredGroups.map((group) => {
            const memberCount = getMemberCount(group.id);
            return (
              <Card key={group.id} className="bg-white border-green-100 shadow-sm card-hover group overflow-hidden">
                <div className={`h-1 bg-${['green', 'emerald', 'teal', 'cyan', 'blue', 'indigo'][groups.indexOf(group) % 6]}-500`} />
                
                <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className={`w-2 sm:w-3 h-10 sm:h-12 rounded-full bg-${['green', 'emerald', 'teal', 'cyan', 'blue', 'indigo'][groups.indexOf(group) % 6]}-500 flex-shrink-0`} />
                      <div className="min-w-0">
                        <CardTitle className="text-sm sm:text-base lg:text-lg text-gray-900 truncate">{group.name}</CardTitle>
                        <CardDescription className="line-clamp-1 text-gray-400 text-xs sm:text-sm">
                          {group.description || 'Açıklama yok'}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-green-700 hover:bg-green-50 flex-shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-green-100 w-44 sm:w-48">
                        <DropdownMenuLabel className="text-gray-500 text-xs">İşlemler</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-green-100" />
                        <Link href={`/groups/${group.id}`}>
                          <DropdownMenuItem className="text-gray-700 hover:text-green-700 hover:bg-green-50 cursor-pointer text-sm">
                            <Eye className="h-4 w-4 mr-2 text-gray-400" />
                            Detayları Gör
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          onClick={() => handleEditGroup(group)}
                          className="text-gray-700 hover:text-green-700 hover:bg-green-50 cursor-pointer text-sm"
                        >
                          <Edit className="h-4 w-4 mr-2 text-gray-400" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-700 hover:text-green-700 hover:bg-green-50 cursor-pointer text-sm">
                          <UserPlus className="h-4 w-4 mr-2 text-gray-400" />
                          Üye Ekle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-green-100" />
                        <DropdownMenuItem 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer text-sm"
                          onClick={() => handleDeleteGroup(group)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
                  {/* Coach */}
                  {group.coach && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                        <AvatarFallback className="text-[10px] sm:text-xs bg-green-50 text-green-600">
                          {group.coach?.full_name ? group.coach.full_name.split(' ')[0][0] : group.coach?.email?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm text-gray-500 truncate">
                        {group.coach?.full_name || group.coach?.email || 'Antrenör atanmadı'}
                      </span>
                    </div>
                  )}

                  {/* Members & Link */}
                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-green-100">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5 sm:-space-x-2">
                        {[...Array(Math.min(memberCount, 3))].map((_, i) => (
                          <div 
                            key={i}
                            className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-green-100 border-2 border-white flex items-center justify-center"
                          >
                            <span className="text-[8px] sm:text-[10px] text-green-600 font-medium">
                              {String.fromCharCode(65 + i)}
                            </span>
                          </div>
                        ))}
                        {memberCount > 3 && (
                          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                            <span className="text-[8px] sm:text-[10px] text-white font-medium">
                              +{memberCount - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{memberCount} üye</span>
                    </div>
                    <Link href={`/groups/${group.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <span className="hidden xs:inline">Detaylar</span>
                        <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <GroupFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        group={editingGroup ? {
          id: editingGroup.id,
          name: editingGroup.name,
          description: editingGroup.description || null,
          coach_id: editingGroup.coach_id || null,
          created_at: editingGroup.created_at,
          updated_at: editingGroup.updated_at,
        } : null}
        coaches={[]}
        loading={formLoading}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Grubu Sil"
        description={`"${deletingGroup?.name}" grubunu silmek istediğinize emin misiniz? Gruptaki üyeler gruptan çıkarılacak ancak silinmeyecektir.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        variant="destructive"
        loading={formLoading}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
