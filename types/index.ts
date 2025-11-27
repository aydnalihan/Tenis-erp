// ============================
// DATABASE TYPES
// ============================

export interface Member {
  id: string;
  name: string;
  surname: string;
  phone: string | null;
  email: string | null;
  birthdate: string | null;
  is_child: boolean;
  parent_name: string | null;
  parent_phone: string | null;
  group_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  coach_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  group_id: string;
  date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  lesson_id: string;
  member_id: string;
  status: 'present' | 'absent';
  created_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  period: string; // YYYY-MM format
  amount: number;
  paid: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  min_stock: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'coach';
  created_at: string;
}

// ============================
// EXTENDED TYPES (with relations)
// ============================

export interface MemberWithGroup extends Member {
  group: Group | null;
}

export interface MemberWithDetails extends Member {
  group: Group | null;
  attendance: AttendanceWithLesson[];
  payments: Payment[];
}

export interface GroupWithMembers extends Group {
  members: Member[];
  coach: User | null;
}

export interface GroupWithDetails extends Group {
  members: Member[];
  coach: User | null;
  lessons: Lesson[];
}

export interface LessonWithGroup extends Lesson {
  group: Group;
}

export interface LessonWithAttendance extends Lesson {
  group: Group;
  attendance: AttendanceWithMember[];
}

export interface AttendanceWithMember extends Attendance {
  member: Member;
}

export interface AttendanceWithLesson extends Attendance {
  lesson: Lesson;
}

export interface PaymentWithMember extends Payment {
  member: Member;
}

// ============================
// FORM TYPES
// ============================

export interface MemberFormData {
  name: string;
  surname: string;
  phone?: string;
  email?: string;
  birthdate?: string;
  is_child: boolean;
  parent_name?: string;
  parent_phone?: string;
  group_id?: string;
}

export interface GroupFormData {
  name: string;
  description?: string;
  coach_id?: string;
}

export interface LessonFormData {
  group_id: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface PaymentFormData {
  member_id: string;
  period: string;
  amount: number;
  paid: boolean;
}

export interface InventoryFormData {
  name: string;
  category?: string;
  quantity: number;
  min_stock?: number;
  description?: string;
}

// ============================
// REPORT TYPES
// ============================

export interface MonthlyReport {
  period: string;
  totalLessons: number;
  totalAttendance: number;
  attendanceRate: number;
  absentMembers: { member: Member; absences: number }[];
  overduePayments: PaymentWithMember[];
  groupDistribution: { group: Group; memberCount: number }[];
}

export interface AttendanceSummary {
  memberId: string;
  memberName: string;
  totalLessons: number;
  present: number;
  absent: number;
  attendanceRate: number;
}

// ============================
// UI TYPES
// ============================

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface DashboardStats {
  totalMembers: number;
  totalGroups: number;
  monthlyLessons: number;
  attendanceRate: number;
  overduePayments: number;
  inventoryItems: number;
}

// ============================
// API RESPONSE TYPES
// ============================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MemberFilterParams extends FilterParams {
  groupId?: string;
  isChild?: boolean;
  status?: 'active' | 'inactive';
}

export interface PaymentFilterParams extends FilterParams {
  period?: string;
  paid?: boolean;
}

export interface AttendanceFilterParams extends FilterParams {
  lessonId?: string;
  memberId?: string;
  status?: 'present' | 'absent';
  dateFrom?: string;
  dateTo?: string;
}

