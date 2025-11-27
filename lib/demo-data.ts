// Demo data store - Bu dosya Supabase bağlanana kadar kullanılacak
// LocalStorage ile persist edilecek

export interface DemoMember {
  id: string;
  name: string;
  surname: string;
  email: string | null;
  phone: string | null;
  birthdate: string | null;
  is_child: boolean;
  parent_name: string | null;
  parent_phone: string | null;
  group_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface DemoGroup {
  id: string;
  name: string;
  description: string | null;
  coach_id: string | null;
  coach_name: string | null;
  color: string;
  schedule: string;
  created_at: string;
  updated_at: string;
}

export interface DemoLesson {
  id: string;
  group_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
}

export interface DemoAttendance {
  id: string;
  lesson_id: string;
  member_id: string;
  status: 'present' | 'absent';
  created_at: string;
}

export interface DemoPayment {
  id: string;
  member_id: string;
  period: string;
  amount: number;
  paid: boolean;
  paid_at: string | null;
  created_at: string;
}

export interface DemoInventory {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  min_stock: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Initial demo data
const initialMembers: DemoMember[] = [
  { id: '1', name: 'Ahmet', surname: 'Yılmaz', email: 'ahmet@email.com', phone: '0532 123 4567', birthdate: '1990-05-15', is_child: false, parent_name: null, parent_phone: null, group_id: '1', status: 'active', created_at: '2023-01-15', updated_at: '2023-01-15' },
  { id: '2', name: 'Elif', surname: 'Kaya', email: 'elif@email.com', phone: '0533 234 5678', birthdate: '2010-03-20', is_child: true, parent_name: 'Mehmet Kaya', parent_phone: '0533 234 5679', group_id: '2', status: 'active', created_at: '2023-02-10', updated_at: '2023-02-10' },
  { id: '3', name: 'Can', surname: 'Demir', email: 'can@email.com', phone: '0534 345 6789', birthdate: '2012-07-08', is_child: true, parent_name: 'Ayşe Demir', parent_phone: '0534 345 6780', group_id: '3', status: 'active', created_at: '2023-03-05', updated_at: '2023-03-05' },
  { id: '4', name: 'Zeynep', surname: 'Şahin', email: 'zeynep@email.com', phone: '0535 456 7890', birthdate: '1985-11-22', is_child: false, parent_name: null, parent_phone: null, group_id: '1', status: 'active', created_at: '2023-04-12', updated_at: '2023-04-12' },
  { id: '5', name: 'Berk', surname: 'Aydın', email: 'berk@email.com', phone: '0536 567 8901', birthdate: '2015-09-30', is_child: true, parent_name: 'Hasan Aydın', parent_phone: '0536 567 8902', group_id: '4', status: 'active', created_at: '2023-05-20', updated_at: '2023-05-20' },
  { id: '6', name: 'Murat', surname: 'Öztürk', email: 'murat@email.com', phone: '0537 678 9012', birthdate: '1988-02-14', is_child: false, parent_name: null, parent_phone: null, group_id: '1', status: 'active', created_at: '2023-06-01', updated_at: '2023-06-01' },
  { id: '7', name: 'Selin', surname: 'Arslan', email: 'selin@email.com', phone: '0538 789 0123', birthdate: '2008-12-05', is_child: true, parent_name: 'Ali Arslan', parent_phone: '0538 789 0124', group_id: '2', status: 'active', created_at: '2023-06-15', updated_at: '2023-06-15' },
  { id: '8', name: 'Emre', surname: 'Çelik', email: 'emre@email.com', phone: '0539 890 1234', birthdate: '1992-08-20', is_child: false, parent_name: null, parent_phone: null, group_id: '5', status: 'active', created_at: '2023-07-01', updated_at: '2023-07-01' },
];

const initialGroups: DemoGroup[] = [
  { id: '1', name: 'Yetişkinler A', description: 'İleri seviye yetişkin grubu', coach_id: '1', coach_name: 'Mehmet Hoca', color: 'bg-blue-500', schedule: 'Pzt-Çar-Cum 10:00-11:30', created_at: '2023-01-01', updated_at: '2023-01-01' },
  { id: '2', name: 'Gençler B', description: 'Orta seviye genç grubu (14-18 yaş)', coach_id: '2', coach_name: 'Ali Hoca', color: 'bg-purple-500', schedule: 'Sal-Per 14:00-15:30', created_at: '2023-01-01', updated_at: '2023-01-01' },
  { id: '3', name: 'Yıldızlar', description: 'Yarışmacı genç grubu', coach_id: '1', coach_name: 'Mehmet Hoca', color: 'bg-yellow-500', schedule: 'Pzt-Çar-Cum 16:00-18:00', created_at: '2023-01-01', updated_at: '2023-01-01' },
  { id: '4', name: 'Minikler', description: 'Başlangıç seviyesi çocuk grubu (6-10 yaş)', coach_id: '3', coach_name: 'Ayşe Hoca', color: 'bg-green-500', schedule: 'Sal-Per-Cmt 10:00-11:00', created_at: '2023-01-01', updated_at: '2023-01-01' },
  { id: '5', name: 'Yetişkinler B', description: 'Başlangıç seviye yetişkin grubu', coach_id: '2', coach_name: 'Ali Hoca', color: 'bg-red-500', schedule: 'Sal-Per 18:00-19:30', created_at: '2023-01-01', updated_at: '2023-01-01' },
];

const initialLessons: DemoLesson[] = [
  { id: '1', group_id: '1', date: '2024-11-25', start_time: '10:00', end_time: '11:30', status: 'completed', notes: null, created_at: '2024-11-20' },
  { id: '2', group_id: '2', date: '2024-11-25', start_time: '14:00', end_time: '15:30', status: 'completed', notes: null, created_at: '2024-11-20' },
  { id: '3', group_id: '1', date: '2024-11-27', start_time: '10:00', end_time: '11:30', status: 'scheduled', notes: null, created_at: '2024-11-20' },
  { id: '4', group_id: '4', date: '2024-11-26', start_time: '10:00', end_time: '11:00', status: 'scheduled', notes: null, created_at: '2024-11-20' },
  { id: '5', group_id: '3', date: '2024-11-27', start_time: '16:00', end_time: '18:00', status: 'scheduled', notes: null, created_at: '2024-11-20' },
  { id: '6', group_id: '2', date: '2024-11-28', start_time: '14:00', end_time: '15:30', status: 'scheduled', notes: null, created_at: '2024-11-20' },
  { id: '7', group_id: '5', date: '2024-11-28', start_time: '18:00', end_time: '19:30', status: 'scheduled', notes: null, created_at: '2024-11-20' },
  { id: '8', group_id: '1', date: '2024-11-29', start_time: '10:00', end_time: '11:30', status: 'scheduled', notes: null, created_at: '2024-11-20' },
];

const initialPayments: DemoPayment[] = [
  { id: '1', member_id: '1', period: '2024-11', amount: 750, paid: true, paid_at: '2024-11-05', created_at: '2024-11-01' },
  { id: '2', member_id: '2', period: '2024-11', amount: 650, paid: false, paid_at: null, created_at: '2024-11-01' },
  { id: '3', member_id: '3', period: '2024-11', amount: 700, paid: false, paid_at: null, created_at: '2024-11-01' },
  { id: '4', member_id: '4', period: '2024-11', amount: 750, paid: true, paid_at: '2024-11-03', created_at: '2024-11-01' },
  { id: '5', member_id: '5', period: '2024-11', amount: 550, paid: true, paid_at: '2024-11-01', created_at: '2024-11-01' },
  { id: '6', member_id: '6', period: '2024-11', amount: 750, paid: false, paid_at: null, created_at: '2024-11-01' },
  { id: '7', member_id: '7', period: '2024-11', amount: 650, paid: false, paid_at: null, created_at: '2024-11-01' },
  { id: '8', member_id: '8', period: '2024-11', amount: 750, paid: true, paid_at: '2024-11-08', created_at: '2024-11-01' },
];

const initialInventory: DemoInventory[] = [
  { id: '1', name: 'Wilson Pro Staff Raket', category: 'Raket', quantity: 24, min_stock: 10, description: 'Profesyonel tenis raketi', created_at: '2024-01-01', updated_at: '2024-11-20' },
  { id: '2', name: 'Penn Championship Toplar', category: 'Top', quantity: 156, min_stock: 50, description: '3lü paket tenis topu', created_at: '2024-01-01', updated_at: '2024-11-22' },
  { id: '3', name: 'Tenis Filesi', category: 'Ekipman', quantity: 8, min_stock: 4, description: 'Standart kort filesi', created_at: '2024-01-01', updated_at: '2024-11-15' },
  { id: '4', name: 'Top Sepeti', category: 'Ekipman', quantity: 6, min_stock: 4, description: '150 top kapasiteli', created_at: '2024-01-01', updated_at: '2024-11-10' },
  { id: '5', name: 'Çocuk Raketi (21 inch)', category: 'Raket', quantity: 12, min_stock: 8, description: '6-8 yaş için uygun', created_at: '2024-01-01', updated_at: '2024-11-18' },
  { id: '6', name: 'Antrenman Konileri', category: 'Ekipman', quantity: 3, min_stock: 10, description: '20li set', created_at: '2024-01-01', updated_at: '2024-11-01' },
  { id: '7', name: 'Grip Bandı', category: 'Aksesuar', quantity: 45, min_stock: 20, description: 'Overgrip paketi', created_at: '2024-01-01', updated_at: '2024-11-19' },
];

const initialAttendance: DemoAttendance[] = [];

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Demo Data Store Class
class DemoDataStore {
  private members: DemoMember[] = [];
  private groups: DemoGroup[] = [];
  private lessons: DemoLesson[] = [];
  private payments: DemoPayment[] = [];
  private inventory: DemoInventory[] = [];
  private attendance: DemoAttendance[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    } else {
      this.members = [...initialMembers];
      this.groups = [...initialGroups];
      this.lessons = [...initialLessons];
      this.payments = [...initialPayments];
      this.inventory = [...initialInventory];
      this.attendance = [...initialAttendance];
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('tenis-erp-demo-data');
      if (stored) {
        const data = JSON.parse(stored);
        this.members = data.members || [...initialMembers];
        this.groups = data.groups || [...initialGroups];
        this.lessons = data.lessons || [...initialLessons];
        this.payments = data.payments || [...initialPayments];
        this.inventory = data.inventory || [...initialInventory];
        this.attendance = data.attendance || [...initialAttendance];
      } else {
        this.members = [...initialMembers];
        this.groups = [...initialGroups];
        this.lessons = [...initialLessons];
        this.payments = [...initialPayments];
        this.inventory = [...initialInventory];
        this.attendance = [...initialAttendance];
        this.saveToStorage();
      }
    } catch {
      this.members = [...initialMembers];
      this.groups = [...initialGroups];
      this.lessons = [...initialLessons];
      this.payments = [...initialPayments];
      this.inventory = [...initialInventory];
      this.attendance = [...initialAttendance];
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tenis-erp-demo-data', JSON.stringify({
        members: this.members,
        groups: this.groups,
        lessons: this.lessons,
        payments: this.payments,
        inventory: this.inventory,
        attendance: this.attendance,
      }));
    }
  }

  // Members
  getMembers() { return [...this.members]; }
  getMemberById(id: string) { return this.members.find(m => m.id === id); }
  getMembersByGroup(groupId: string) { return this.members.filter(m => m.group_id === groupId); }
  
  addMember(data: Omit<DemoMember, 'id' | 'created_at' | 'updated_at'>) {
    const member: DemoMember = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.members.push(member);
    this.saveToStorage();
    return member;
  }
  
  updateMember(id: string, data: Partial<DemoMember>) {
    const index = this.members.findIndex(m => m.id === id);
    if (index !== -1) {
      this.members[index] = { ...this.members[index], ...data, updated_at: new Date().toISOString() };
      this.saveToStorage();
      return this.members[index];
    }
    return null;
  }
  
  deleteMember(id: string) {
    this.members = this.members.filter(m => m.id !== id);
    this.saveToStorage();
  }

  // Groups
  getGroups() { return [...this.groups]; }
  getGroupById(id: string) { return this.groups.find(g => g.id === id); }
  
  addGroup(data: Omit<DemoGroup, 'id' | 'created_at' | 'updated_at'>) {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500'];
    const group: DemoGroup = {
      ...data,
      id: generateId(),
      color: data.color || colors[this.groups.length % colors.length],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.groups.push(group);
    this.saveToStorage();
    return group;
  }
  
  updateGroup(id: string, data: Partial<DemoGroup>) {
    const index = this.groups.findIndex(g => g.id === id);
    if (index !== -1) {
      this.groups[index] = { ...this.groups[index], ...data, updated_at: new Date().toISOString() };
      this.saveToStorage();
      return this.groups[index];
    }
    return null;
  }
  
  deleteGroup(id: string) {
    this.groups = this.groups.filter(g => g.id !== id);
    // Remove group reference from members
    this.members = this.members.map(m => m.group_id === id ? { ...m, group_id: null } : m);
    this.saveToStorage();
  }

  // Lessons
  getLessons() { return [...this.lessons]; }
  getLessonById(id: string) { return this.lessons.find(l => l.id === id); }
  getLessonsByGroup(groupId: string) { return this.lessons.filter(l => l.group_id === groupId); }
  getLessonsByDate(date: string) { return this.lessons.filter(l => l.date === date); }
  
  addLesson(data: Omit<DemoLesson, 'id' | 'created_at'>) {
    const lesson: DemoLesson = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    this.lessons.push(lesson);
    this.saveToStorage();
    return lesson;
  }
  
  updateLesson(id: string, data: Partial<DemoLesson>) {
    const index = this.lessons.findIndex(l => l.id === id);
    if (index !== -1) {
      this.lessons[index] = { ...this.lessons[index], ...data };
      this.saveToStorage();
      return this.lessons[index];
    }
    return null;
  }
  
  deleteLesson(id: string) {
    this.lessons = this.lessons.filter(l => l.id !== id);
    this.saveToStorage();
  }

  // Attendance
  getAttendance() { return [...this.attendance]; }
  getAttendanceByLesson(lessonId: string) { return this.attendance.filter(a => a.lesson_id === lessonId); }
  getAttendanceByMember(memberId: string) { return this.attendance.filter(a => a.member_id === memberId); }
  
  saveAttendance(lessonId: string, records: { member_id: string; status: 'present' | 'absent' }[]) {
    // Remove existing attendance for this lesson
    this.attendance = this.attendance.filter(a => a.lesson_id !== lessonId);
    
    // Add new records
    const newRecords = records.map(r => ({
      id: generateId(),
      lesson_id: lessonId,
      member_id: r.member_id,
      status: r.status,
      created_at: new Date().toISOString(),
    }));
    this.attendance.push(...newRecords);
    
    // Mark lesson as completed
    this.updateLesson(lessonId, { status: 'completed' });
    
    this.saveToStorage();
    return newRecords;
  }

  // Payments
  getPayments() { return [...this.payments]; }
  getPaymentsByMember(memberId: string) { return this.payments.filter(p => p.member_id === memberId); }
  getPaymentsByPeriod(period: string) { return this.payments.filter(p => p.period === period); }
  
  addPayment(data: Omit<DemoPayment, 'id' | 'created_at'>) {
    const payment: DemoPayment = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    this.payments.push(payment);
    this.saveToStorage();
    return payment;
  }
  
  updatePayment(id: string, data: Partial<DemoPayment>) {
    const index = this.payments.findIndex(p => p.id === id);
    if (index !== -1) {
      this.payments[index] = { ...this.payments[index], ...data };
      this.saveToStorage();
      return this.payments[index];
    }
    return null;
  }
  
  markPaymentPaid(id: string) {
    return this.updatePayment(id, { paid: true, paid_at: new Date().toISOString() });
  }
  
  markPaymentUnpaid(id: string) {
    return this.updatePayment(id, { paid: false, paid_at: null });
  }
  
  deletePayment(id: string) {
    this.payments = this.payments.filter(p => p.id !== id);
    this.saveToStorage();
  }
  
  generatePaymentsForPeriod(period: string, amount: number) {
    const activeMembers = this.members.filter(m => m.status === 'active');
    const existingPayments = this.getPaymentsByPeriod(period);
    const existingMemberIds = existingPayments.map(p => p.member_id);
    
    const newPayments: DemoPayment[] = [];
    activeMembers.forEach(member => {
      if (!existingMemberIds.includes(member.id)) {
        const payment = this.addPayment({
          member_id: member.id,
          period,
          amount,
          paid: false,
          paid_at: null,
        });
        newPayments.push(payment);
      }
    });
    
    return newPayments;
  }

  // Inventory
  getInventory() { return [...this.inventory]; }
  getInventoryById(id: string) { return this.inventory.find(i => i.id === id); }
  
  addInventoryItem(data: Omit<DemoInventory, 'id' | 'created_at' | 'updated_at'>) {
    const item: DemoInventory = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.inventory.push(item);
    this.saveToStorage();
    return item;
  }
  
  updateInventoryItem(id: string, data: Partial<DemoInventory>) {
    const index = this.inventory.findIndex(i => i.id === id);
    if (index !== -1) {
      this.inventory[index] = { ...this.inventory[index], ...data, updated_at: new Date().toISOString() };
      this.saveToStorage();
      return this.inventory[index];
    }
    return null;
  }
  
  deleteInventoryItem(id: string) {
    this.inventory = this.inventory.filter(i => i.id !== id);
    this.saveToStorage();
  }

  // Reset to initial data
  resetData() {
    this.members = [...initialMembers];
    this.groups = [...initialGroups];
    this.lessons = [...initialLessons];
    this.payments = [...initialPayments];
    this.inventory = [...initialInventory];
    this.attendance = [...initialAttendance];
    this.saveToStorage();
  }
}

// Singleton instance
let demoStore: DemoDataStore | null = null;

export function getDemoStore(): DemoDataStore {
  if (!demoStore) {
    demoStore = new DemoDataStore();
  }
  return demoStore;
}

