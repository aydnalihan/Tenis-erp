'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  X, 
  Calendar,
  Users,
  Save,
  Clock,
  UserCheck,
  UserX,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
import { getDemoStore, DemoLesson, DemoGroup, DemoMember, DemoAttendance } from '@/lib/demo-data';
import { toast } from 'sonner';

export default function AttendancePage() {
  const [groups, setGroups] = useState<DemoGroup[]>([]);
  const [lessons, setLessons] = useState<DemoLesson[]>([]);
  const [members, setMembers] = useState<DemoMember[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<DemoAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});

  useEffect(() => {
    const store = getDemoStore();
    setGroups(store.getGroups());
    setLessons(store.getLessons());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      const store = getDemoStore();
      const groupMembers = store.getMembersByGroup(selectedGroupId);
      setMembers(groupMembers);
      
      const initialAttendance: Record<string, 'present' | 'absent'> = {};
      groupMembers.forEach(m => {
        initialAttendance[m.id] = 'present';
      });
      setAttendance(initialAttendance);
      setSelectedLessonId('');
    } else {
      setMembers([]);
      setAttendance({});
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (selectedLessonId) {
      const store = getDemoStore();
      const existing = store.getAttendanceByLesson(selectedLessonId);
      setExistingAttendance(existing);
      
      if (existing.length > 0) {
        const attendanceMap: Record<string, 'present' | 'absent'> = {};
        members.forEach(m => {
          const record = existing.find(a => a.member_id === m.id);
          attendanceMap[m.id] = record ? record.status : 'present';
        });
        setAttendance(attendanceMap);
      }
    }
  }, [selectedLessonId, members]);

  const filteredLessons = useMemo(() => {
    if (!selectedGroupId) return [];
    return lessons.filter(l => l.group_id === selectedGroupId);
  }, [lessons, selectedGroupId]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

  const handleSetAll = (status: 'present' | 'absent') => {
    const newAttendance: Record<string, 'present' | 'absent'> = {};
    members.forEach(m => {
      newAttendance[m.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSave = () => {
    if (!selectedLessonId) {
      toast.error('Lütfen bir ders seçin');
      return;
    }

    setSaving(true);
    
    const store = getDemoStore();
    const records = Object.entries(attendance).map(([member_id, status]) => ({
      member_id,
      status,
    }));
    
    store.saveAttendance(selectedLessonId, records);
    setLessons(store.getLessons());
    
    toast.success('Yoklama başarıyla kaydedildi');
    setSaving(false);
  };

  const recentAttendance = useMemo(() => {
    const store = getDemoStore();
    const allAttendance = store.getAttendance();
    const completedLessons = lessons
      .filter(l => l.status === 'completed')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
    
    return completedLessons.map(lesson => {
      const group = groups.find(g => g.id === lesson.group_id);
      const lessonAttendance = allAttendance.filter(a => a.lesson_id === lesson.id);
      const present = lessonAttendance.filter(a => a.status === 'present').length;
      const absent = lessonAttendance.filter(a => a.status === 'absent').length;
      
      return {
        date: lesson.date,
        group: group?.name || 'Bilinmiyor',
        groupColor: group?.color || 'bg-gray-400',
        present,
        absent,
      };
    });
  }, [lessons, groups]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 page-transition">
        <Skeleton className="h-8 sm:h-10 w-32 sm:w-48 bg-green-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Skeleton className="h-20 sm:h-24 bg-green-50" />
          <Skeleton className="h-20 sm:h-24 bg-green-50" />
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Yoklama</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Ders yoklamalarını alın ve takip edin
          </p>
        </div>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Grup Seçin</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="h-10 sm:h-11 border-green-200 focus:border-green-400 focus:ring-green-200 rounded-xl text-sm">
                <SelectValue placeholder="Grup seçin" />
              </SelectTrigger>
              <SelectContent className="border-green-100">
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${group.color}`} />
                      {group.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Ders Seçin</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <Select 
              value={selectedLessonId} 
              onValueChange={setSelectedLessonId}
              disabled={!selectedGroupId}
            >
              <SelectTrigger className="h-10 sm:h-11 border-green-200 focus:border-green-400 focus:ring-green-200 rounded-xl disabled:opacity-50 text-sm">
                <SelectValue placeholder={selectedGroupId ? "Ders seçin" : "Önce grup seçin"} />
              </SelectTrigger>
              <SelectContent className="border-green-100">
                {filteredLessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(lesson.date).toLocaleDateString('tr-TR', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })} - {lesson.start_time}
                      </span>
                      {lesson.status === 'completed' && (
                        <Badge className="ml-1 bg-green-100 text-green-700 border-0 text-[10px]">
                          ✓
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
                {filteredLessons.length === 0 && (
                  <div className="p-3 text-sm text-gray-400 text-center">
                    Bu grup için ders bulunamadı
                  </div>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Attendance Form */}
        <Card className="lg:col-span-2 bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg text-gray-900">Yoklama Listesi</CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm mt-1">
                  {selectedGroup && selectedLesson 
                    ? (
                      <>
                        <span className="hidden sm:inline">{selectedGroup.name} - {new Date(selectedLesson.date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })} {selectedLesson.start_time}</span>
                        <span className="sm:hidden">{selectedGroup.name} - {new Date(selectedLesson.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                      </>
                    )
                    : 'Grup ve ders seçin'}
                </CardDescription>
              </div>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg shadow-green-200 w-full sm:w-auto text-sm" 
                onClick={handleSave}
                disabled={!selectedLessonId || members.length === 0 || saving}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {!selectedGroupId ? (
              <div className="text-center py-12 sm:py-16">
                <div className="rounded-full p-4 bg-green-50 w-fit mx-auto mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-300" />
                </div>
                <p className="font-medium text-gray-600 text-sm sm:text-base">Grup Seçin</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Yoklama almak için önce bir grup seçin</p>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="rounded-full p-4 bg-green-50 w-fit mx-auto mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-300" />
                </div>
                <p className="font-medium text-gray-600 text-sm sm:text-base">Üye Bulunamadı</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Bu grupta henüz üye yok</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-green-50 border border-green-100 mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{presentCount} Katıldı</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{absentCount} Katılmadı</span>
                  </div>
                  <div className="flex gap-2 ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSetAll('present')}
                      className="flex-1 sm:flex-none border-green-200 text-green-700 hover:bg-green-100 text-xs h-8"
                    >
                      <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden xs:inline">Tümü Katıldı</span>
                      <span className="xs:hidden">Tümü ✓</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSetAll('absent')}
                      className="flex-1 sm:flex-none border-green-200 text-gray-600 hover:bg-green-50 text-xs h-8"
                    >
                      <UserX className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden xs:inline">Tümü Katılmadı</span>
                      <span className="xs:hidden">Tümü ✗</span>
                    </Button>
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all ${
                        attendance[member.id] === 'present' 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                          <AvatarFallback className={`text-xs sm:text-sm font-medium ${
                            attendance[member.id] === 'present'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {member.name[0]}{member.surname[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="font-medium text-gray-800 text-sm sm:text-base block truncate">{member.name} {member.surname}</span>
                          {member.is_child && (
                            <Badge className="mt-0.5 bg-gray-100 text-gray-500 border-0 text-[10px]">
                              Çocuk
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant={attendance[member.id] === 'present' ? 'default' : 'outline'}
                          className={`h-8 w-8 sm:h-9 sm:w-9 p-0 ${attendance[member.id] === 'present' 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'border-green-200 text-gray-500 hover:bg-green-50'
                          }`}
                          onClick={() => setAttendance(prev => ({ ...prev, [member.id]: 'present' }))}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[member.id] === 'absent' ? 'default' : 'outline'}
                          className={`h-8 w-8 sm:h-9 sm:w-9 p-0 ${attendance[member.id] === 'absent' 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'border-red-200 text-gray-500 hover:bg-red-50'
                          }`}
                          onClick={() => setAttendance(prev => ({ ...prev, [member.id]: 'absent' }))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg text-gray-900">Son Yoklamalar</CardTitle>
            <CardDescription className="text-gray-400 text-xs sm:text-sm">
              Son alınan yoklama kayıtları
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {recentAttendance.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="rounded-full p-3 bg-green-50 w-fit mx-auto mb-3">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-300" />
                </div>
                <p className="text-xs sm:text-sm text-gray-400">Henüz yoklama kaydı yok</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentAttendance.map((record, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className={`w-1 h-8 sm:h-10 rounded-full ${record.groupColor} flex-shrink-0`} />
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-gray-700 truncate">{record.group}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          {new Date(record.date).toLocaleDateString('tr-TR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs flex-shrink-0">
                      <span className="text-green-600 font-medium">
                        <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-0.5" />
                        {record.present}
                      </span>
                      <span className="text-red-500 font-medium">
                        <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-0.5" />
                        {record.absent}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Absentee Stats - Hidden on mobile, shown as simplified on tablet+ */}
      <Card className="hidden sm:block bg-white border-green-100 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg text-gray-900">Devamsızlık İstatistikleri</CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            Bu ay en çok devamsızlık yapan üyeler
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-green-100 hover:bg-transparent">
                  <TableHead className="text-gray-500 text-xs sm:text-sm">Üye</TableHead>
                  <TableHead className="text-gray-500 text-xs sm:text-sm">Grup</TableHead>
                  <TableHead className="text-center text-gray-500 text-xs sm:text-sm">Toplam</TableHead>
                  <TableHead className="text-center text-gray-500 text-xs sm:text-sm">Katılım</TableHead>
                  <TableHead className="text-center text-gray-500 text-xs sm:text-sm">Oran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.slice(0, 3).map((group) => {
                  const groupMembers = getDemoStore().getMembersByGroup(group.id);
                  if (groupMembers.length === 0) return null;
                  const member = groupMembers[0];
                  return (
                    <TableRow key={member.id} className="border-green-50 hover:bg-green-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                            <AvatarFallback className="bg-green-50 text-green-600 text-[10px] sm:text-xs">
                              {member.name[0]}{member.surname[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-700 text-xs sm:text-sm">{member.name} {member.surname}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className={`w-2 h-2 rounded-full ${group.color}`} />
                          <span className="text-gray-600 text-xs sm:text-sm">{group.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-gray-600 text-xs sm:text-sm">12</TableCell>
                      <TableCell className="text-center text-green-600 font-medium text-xs sm:text-sm">10</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-100 text-green-700 border-0 text-[10px] sm:text-xs">
                          %83
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
