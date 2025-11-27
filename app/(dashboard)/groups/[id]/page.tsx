'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Users,
  Calendar,
  Plus,
  MoreHorizontal,
  Mail,
  UserMinus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDemoStore, DemoGroup, DemoMember, DemoLesson } from '@/lib/demo-data';
import { GroupFormDialog } from '@/components/groups/group-form-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [group, setGroup] = useState<DemoGroup | null>(null);
  const [members, setMembers] = useState<DemoMember[]>([]);
  const [lessons, setLessons] = useState<DemoLesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<DemoMember | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load data
  useEffect(() => {
    const store = getDemoStore();
    const groupData = store.getGroupById(id);
    
    if (groupData) {
      setGroup(groupData);
      setMembers(store.getMembersByGroup(id));
      setLessons(store.getLessonsByGroup(id));
    }
    setLoading(false);
  }, [id]);

  const handleEditGroup = (data: any) => {
    setFormLoading(true);
    const store = getDemoStore();
    store.updateGroup(id, {
      name: data.name,
      description: data.description || null,
      coach_id: data.coach_id || null,
    });
    setGroup(store.getGroupById(id) || null);
    toast.success('Grup başarıyla güncellendi');
    setFormLoading(false);
    setEditDialogOpen(false);
  };

  const handleDeleteGroup = () => {
    setFormLoading(true);
    const store = getDemoStore();
    store.deleteGroup(id);
    toast.success('Grup başarıyla silindi');
    setFormLoading(false);
    setDeleteDialogOpen(false);
    router.push('/groups');
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;
    setFormLoading(true);
    const store = getDemoStore();
    store.updateMember(selectedMember.id, { group_id: null });
    setMembers(store.getMembersByGroup(id));
    toast.success('Üye gruptan çıkarıldı');
    setFormLoading(false);
    setRemoveMemberDialogOpen(false);
    setSelectedMember(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-2">Grup Bulunamadı</h2>
        <p className="text-muted-foreground mb-4">Bu grup mevcut değil veya silinmiş.</p>
        <Link href="/groups">
          <Button>Gruplara Dön</Button>
        </Link>
      </div>
    );
  }

  // Parse schedule for display
  const scheduleItems = group.schedule ? group.schedule.split(',').map(s => {
    const parts = s.trim().split(' ');
    return { day: parts[0], time: parts.slice(1).join(' ') };
  }) : [];

  // Get upcoming lessons
  const today = new Date().toISOString().split('T')[0];
  const upcomingLessons = lessons
    .filter(l => l.date >= today && l.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/groups">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Gruplara Dön
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4" />
            Düzenle
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      {/* Group Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-start gap-4">
              <div className={`w-4 h-16 rounded-full ${group.color}`} />
              <div>
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <p className="text-muted-foreground mt-1">{group.description || 'Açıklama yok'}</p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {members.length} üye
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {lessons.length} ders planlandı
                  </Badge>
                </div>
              </div>
            </div>

            {/* Coach Info */}
            <div className="md:ml-auto">
              <p className="text-sm text-muted-foreground mb-2">Antrenör</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {group.coach_name ? group.coach_name.split(' ').map(n => n[0]).join('') : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{group.coach_name || 'Atanmadı'}</p>
                  <p className="text-sm text-muted-foreground">{group.schedule}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Cards */}
      {scheduleItems.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {scheduleItems.map((s, i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.day}</p>
                    <p className="text-sm text-muted-foreground">{s.time}</p>
                  </div>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Üyeler ({members.length})
          </TabsTrigger>
          <TabsTrigger value="lessons" className="gap-2">
            <Calendar className="h-4 w-4" />
            Yaklaşan Dersler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Grup Üyeleri</CardTitle>
                  <CardDescription>
                    Bu grupta kayıtlı olan üyeler
                  </CardDescription>
                </div>
                <Link href="/members">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Üye Ekle
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium">Henüz üye yok</p>
                  <p className="text-sm text-muted-foreground">Bu gruba üye eklemek için Üyeler sayfasına gidin.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Üye</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {member.name[0]}{member.surname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <Link href={`/members/${member.id}`} className="font-medium hover:underline">
                              {member.name} {member.surname}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>{member.email || '-'}</TableCell>
                        <TableCell>{member.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {member.is_child ? 'Çocuk' : 'Yetişkin'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                E-posta Gönder
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setRemoveMemberDialogOpen(true);
                                }}
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Gruptan Çıkar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Yaklaşan Dersler</CardTitle>
                  <CardDescription>
                    Önümüzdeki günler için planlanan dersler
                  </CardDescription>
                </div>
                <Link href="/lessons">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ders Ekle
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingLessons.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium">Yaklaşan ders yok</p>
                  <p className="text-sm text-muted-foreground">Bu grup için ders planlamak için Dersler sayfasına gidin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingLessons.map((lesson) => (
                    <div 
                      key={lesson.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10">
                          <span className="text-xs font-medium text-primary">
                            {new Date(lesson.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {new Date(lesson.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {new Date(lesson.date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <p className="text-sm text-muted-foreground">{lesson.start_time} - {lesson.end_time}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-500">
                        {lesson.status === 'scheduled' ? 'Planlandı' : lesson.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Group Dialog */}
      <GroupFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        group={{
          id: group.id,
          name: group.name,
          description: group.description,
          coach_id: group.coach_id,
          created_at: group.created_at,
          updated_at: group.updated_at,
        }}
        coaches={[]}
        loading={formLoading}
        onSubmit={handleEditGroup}
      />

      {/* Delete Group Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Grubu Sil"
        description={`"${group.name}" grubunu silmek istediğinize emin misiniz? Gruptaki üyeler gruptan çıkarılacak ancak silinmeyecektir.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        variant="destructive"
        loading={formLoading}
        onConfirm={handleDeleteGroup}
      />

      {/* Remove Member Dialog */}
      <ConfirmDialog
        open={removeMemberDialogOpen}
        onOpenChange={setRemoveMemberDialogOpen}
        title="Üyeyi Gruptan Çıkar"
        description={`"${selectedMember?.name} ${selectedMember?.surname}" isimli üyeyi bu gruptan çıkarmak istediğinize emin misiniz?`}
        confirmText="Evet, Çıkar"
        cancelText="İptal"
        variant="destructive"
        loading={formLoading}
        onConfirm={handleRemoveMember}
      />
    </div>
  );
}
