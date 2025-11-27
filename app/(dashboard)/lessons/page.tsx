'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  ClipboardCheck,
  X,
  List,
  Grid3X3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LessonFormDialog } from '@/components/lessons/lesson-form-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { getDemoStore, DemoLesson, DemoGroup } from '@/lib/demo-data';
import { LessonFormValues } from '@/lib/validations/lesson';
import { toast } from 'sonner';

const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const weekDaysFull = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function LessonsPage() {
  const [lessons, setLessons] = useState<DemoLesson[]>([]);
  const [groups, setGroups] = useState<DemoGroup[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [groupFilter, setGroupFilter] = useState('all');
  const [mobileView, setMobileView] = useState<'calendar' | 'list'>('list');
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<DemoLesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<DemoLesson | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const store = getDemoStore();
    setLessons(store.getLessons());
    setGroups(store.getGroups());
    setLoading(false);
  }, []);

  const groupColors = useMemo(() => {
    const colors: Record<string, string> = {};
    groups.forEach(g => {
      colors[g.id] = g.color;
    });
    return colors;
  }, [groups]);

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getLessonsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return lessons.filter(l => {
      const matchesDate = l.date === dateStr;
      const matchesGroup = groupFilter === 'all' || l.group_id === groupFilter;
      return matchesDate && matchesGroup;
    });
  };

  // Get all lessons for current week (for mobile list view)
  const weekLessons = useMemo(() => {
    const allLessons: { date: Date; lessons: DemoLesson[] }[] = [];
    weekDates.forEach(date => {
      const dayLessons = getLessonsForDate(date);
      if (dayLessons.length > 0) {
        allLessons.push({ date, lessons: dayLessons });
      }
    });
    return allLessons;
  }, [weekDates, lessons, groupFilter]);

  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.name || 'Bilinmiyor';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const handleAddLesson = (date?: Date) => {
    setEditingLesson(null);
    setSelectedDate(date ? date.toISOString().split('T')[0] : null);
    setFormDialogOpen(true);
  };

  const handleEditLesson = (lesson: DemoLesson) => {
    setEditingLesson(lesson);
    setSelectedDate(null);
    setFormDialogOpen(true);
  };

  const handleDeleteLesson = (lesson: DemoLesson) => {
    setDeletingLesson(lesson);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: LessonFormValues) => {
    setFormLoading(true);
    
    const store = getDemoStore();
    
    if (editingLesson) {
      store.updateLesson(editingLesson.id, {
        group_id: data.group_id,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        notes: data.notes || null,
      });
      toast.success('Ders başarıyla güncellendi');
    } else {
      store.addLesson({
        group_id: data.group_id,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        notes: data.notes || null,
        status: 'scheduled',
      });
      toast.success('Ders başarıyla eklendi');
    }
    
    setLessons(store.getLessons());
    setFormLoading(false);
    setFormDialogOpen(false);
    setEditingLesson(null);
    setSelectedDate(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingLesson) return;
    
    setFormLoading(true);
    const store = getDemoStore();
    store.deleteLesson(deletingLesson.id);
    setLessons(store.getLessons());
    toast.success('Ders başarıyla silindi');
    setFormLoading(false);
    setDeleteDialogOpen(false);
    setDeletingLesson(null);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 page-transition">
        <Skeleton className="h-8 sm:h-10 w-32 sm:w-48 bg-green-100" />
        <Skeleton className="h-16 sm:h-20 w-full bg-green-50" />
        <Skeleton className="h-[400px] sm:h-[500px] w-full bg-green-50" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 page-transition">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dersler</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Ders takvimini görüntüleyin ve yönetin
          </p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white gap-2 btn-shine shadow-lg shadow-green-200 text-sm sm:text-base w-full sm:w-auto"
          onClick={() => handleAddLesson()}
        >
          <Plus className="h-4 w-4" />
          Yeni Ders Ekle
        </Button>
      </div>

      {/* Calendar Controls */}
      <Card className="bg-white border-green-100 shadow-sm">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateWeek('prev')}
                className="h-9 w-9 sm:h-10 sm:w-10 border-green-200 hover:bg-green-50 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </Button>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 text-center flex-1 justify-center">
                <CalendarIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                  {weekDates[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateWeek('next')}
                className="h-9 w-9 sm:h-10 sm:w-10 border-green-200 hover:bg-green-50 rounded-xl"
              >
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="flex-1 sm:flex-none sm:w-[160px] h-9 border-green-200 rounded-lg text-sm">
                  <SelectValue placeholder="Tüm Gruplar" />
                </SelectTrigger>
                <SelectContent className="border-green-100">
                  <SelectItem value="all">Tüm Gruplar</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${group.color}`} />
                        {group.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => setCurrentDate(new Date())}
                className="border-green-200 text-green-700 hover:bg-green-50 rounded-lg h-9 text-sm px-3"
              >
                Bugün
              </Button>

              {/* Mobile View Toggle */}
              <div className="flex sm:hidden border border-green-200 rounded-lg overflow-hidden ml-auto">
                <Button 
                  variant={mobileView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMobileView('list')}
                  className={`h-9 px-3 rounded-none ${mobileView === 'list' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={mobileView === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMobileView('calendar')}
                  className={`h-9 px-3 rounded-none ${mobileView === 'calendar' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile List View */}
      <div className={`${mobileView === 'list' ? 'block' : 'hidden'} sm:hidden space-y-3`}>
        {weekLessons.length === 0 ? (
          <Card className="bg-white border-green-100 shadow-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full p-4 bg-green-50">
                  <CalendarIcon className="h-6 w-6 text-green-300" />
                </div>
                <p className="font-medium text-gray-600">Bu hafta ders yok</p>
                <p className="text-xs text-gray-400">Yeni ders eklemek için butona tıklayın</p>
                <Button 
                  className="mt-2 bg-green-600 hover:bg-green-700 text-sm"
                  onClick={() => handleAddLesson()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ders Ekle
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          weekLessons.map(({ date, lessons: dayLessons }) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const dayIndex = (date.getDay() + 6) % 7;
            
            return (
              <Card key={date.toISOString()} className="bg-white border-green-100 shadow-sm overflow-hidden">
                <div className={`px-4 py-2 border-b ${isToday ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${isToday ? 'text-green-600' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </span>
                      <span className={`text-sm ${isToday ? 'text-green-600' : 'text-gray-500'}`}>
                        {weekDaysFull[dayIndex]}
                      </span>
                      {isToday && (
                        <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                          Bugün
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddLesson(date)}
                      className="h-7 px-2 text-green-600 hover:bg-green-100 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ekle
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3 space-y-2">
                  {dayLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-green-100 bg-white hover:bg-green-50 transition-colors"
                    >
                      <div className={`w-1.5 h-12 rounded-full ${groupColors[lesson.group_id] || 'bg-gray-400'} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {getGroupName(lesson.group_id)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {lesson.start_time} - {lesson.end_time}
                          </div>
                          {lesson.status === 'completed' && (
                            <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                              Tamamlandı
                            </Badge>
                          )}
                          {lesson.status === 'cancelled' && (
                            <Badge className="bg-red-100 text-red-600 border-0 text-[10px]">
                              İptal
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-green-700 hover:bg-green-100 flex-shrink-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-green-100">
                          <DropdownMenuItem className="text-gray-700 hover:bg-green-50 cursor-pointer text-sm">
                            <ClipboardCheck className="h-4 w-4 mr-2 text-gray-400" />
                            Yoklama Al
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEditLesson(lesson)}
                            className="text-gray-700 hover:bg-green-50 cursor-pointer text-sm"
                          >
                            <Edit className="h-4 w-4 mr-2 text-gray-400" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-green-100" />
                          <DropdownMenuItem 
                            className="text-red-500 hover:bg-red-50 cursor-pointer text-sm"
                            onClick={() => handleDeleteLesson(lesson)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Mobile Calendar View (Mini) */}
      <Card className={`${mobileView === 'calendar' ? 'block' : 'hidden'} sm:hidden bg-white border-green-100 shadow-sm overflow-hidden`}>
        <CardContent className="p-0">
          {/* Mini Day Headers */}
          <div className="grid grid-cols-7 border-b border-green-100 bg-gray-50">
            {weekDates.map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDay?.toDateString() === date.toDateString();
              const dayLessons = getLessonsForDate(date);
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : date)}
                  className={`p-2 text-center transition-colors relative ${
                    isSelected ? 'bg-green-100' : isToday ? 'bg-green-50' : 'hover:bg-gray-100'
                  }`}
                >
                  <p className="text-[10px] text-gray-400 font-medium">{weekDays[i]}</p>
                  <p className={`text-sm font-bold mt-0.5 ${
                    isSelected ? 'text-green-700' : isToday ? 'text-green-600' : 'text-gray-700'
                  }`}>
                    {date.getDate()}
                  </p>
                  {dayLessons.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-1">
                      {dayLessons.slice(0, 3).map((lesson, idx) => (
                        <div 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full ${groupColors[lesson.group_id] || 'bg-gray-400'}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Lessons */}
          {selectedDay && (
            <div className="p-3 space-y-2 border-t border-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedDay.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddLesson(selectedDay)}
                  className="h-7 px-2 text-green-600 hover:bg-green-100 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ekle
                </Button>
              </div>
              {getLessonsForDate(selectedDay).length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-4">Bu gün için ders yok</p>
              ) : (
                getLessonsForDate(selectedDay).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-green-100 bg-gray-50"
                  >
                    <div className={`w-1.5 h-10 rounded-full ${groupColors[lesson.group_id] || 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{getGroupName(lesson.group_id)}</p>
                      <p className="text-xs text-gray-500">{lesson.start_time} - {lesson.end_time}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditLesson(lesson)}
                      className="h-8 w-8 text-gray-400 hover:text-green-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {!selectedDay && (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400">Detayları görmek için bir gün seçin</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desktop Weekly Calendar View */}
      <Card className="hidden sm:block bg-white border-green-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-green-100">
            {weekDates.map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={i} 
                  className={`p-3 sm:p-4 text-center border-r border-green-100 last:border-r-0 ${isToday ? 'bg-green-50' : 'bg-gray-50/50'}`}
                >
                  <p className="text-xs sm:text-sm font-medium text-gray-400">{weekDaysFull[i]}</p>
                  <p className={`text-lg sm:text-xl font-bold mt-1 ${isToday ? 'text-green-600' : 'text-gray-700'}`}>
                    {date.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 min-h-[450px] lg:min-h-[500px]">
            {weekDates.map((date, i) => {
              const dayLessons = getLessonsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={i} 
                  className={`p-2 border-r border-green-100 last:border-r-0 ${isToday ? 'bg-green-50/30' : ''} group/cell`}
                >
                  {/* Add button on hover */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 mb-2 opacity-0 group-hover/cell:opacity-100 transition-opacity text-xs text-gray-400 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleAddLesson(date)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Ders Ekle
                  </Button>

                  <div className="space-y-2">
                    {dayLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => handleEditLesson(lesson)}
                        className="p-2 sm:p-3 rounded-xl border border-green-100 bg-white hover:bg-green-50 hover:border-green-200 transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-2 h-2 rounded-full ${groupColors[lesson.group_id] || 'bg-gray-400'} flex-shrink-0`} />
                            <span className="text-xs font-medium text-gray-700 truncate">
                              {getGroupName(lesson.group_id)}
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-green-700 hover:bg-green-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-green-100">
                              <DropdownMenuItem className="text-gray-700 hover:bg-green-50 cursor-pointer text-sm">
                                <ClipboardCheck className="h-4 w-4 mr-2 text-gray-400" />
                                Yoklama Al
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEditLesson(lesson)}
                                className="text-gray-700 hover:bg-green-50 cursor-pointer text-sm"
                              >
                                <Edit className="h-4 w-4 mr-2 text-gray-400" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-green-100" />
                              <DropdownMenuItem 
                                className="text-red-500 hover:bg-red-50 cursor-pointer text-sm"
                                onClick={() => handleDeleteLesson(lesson)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {lesson.start_time} - {lesson.end_time}
                        </div>
                        {lesson.status === 'completed' && (
                          <Badge className="mt-2 bg-green-100 text-green-700 border-0 text-[10px]">
                            <Users className="h-3 w-3 mr-0.5" />
                            Tamamlandı
                          </Badge>
                        )}
                        {lesson.status === 'cancelled' && (
                          <Badge className="mt-2 bg-red-100 text-red-600 border-0 text-[10px]">
                            <X className="h-3 w-3 mr-0.5" />
                            İptal
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-white border-green-100 shadow-sm">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm text-gray-500">Gruplar</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center gap-1.5 sm:gap-2">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${group.color}`} />
                <span className="text-xs sm:text-sm text-gray-600">{group.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <LessonFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        lesson={editingLesson as any}
        groups={groups.map(g => ({
          id: g.id,
          name: g.name,
          description: g.description,
          coach_id: g.coach_id,
          created_at: g.created_at,
          updated_at: g.updated_at,
        }))}
        loading={formLoading}
        defaultDate={selectedDate || undefined}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Dersi Sil"
        description={`${deletingLesson ? getGroupName(deletingLesson.group_id) : ''} grubunun ${deletingLesson?.date} tarihli dersini silmek istediğinize emin misiniz?`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        variant="destructive"
        loading={formLoading}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
