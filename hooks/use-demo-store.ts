'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDemoStore, DemoMember, DemoGroup, DemoLesson, DemoPayment, DemoInventory, DemoAttendance } from '@/lib/demo-data';
import { toast } from 'sonner';

// Members Hook
export function useMembers() {
  const [members, setMembers] = useState<DemoMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const store = getDemoStore();
    setMembers(store.getMembers());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addMember = useCallback((data: Omit<DemoMember, 'id' | 'created_at' | 'updated_at'>) => {
    const store = getDemoStore();
    const member = store.addMember(data);
    toast.success('Üye başarıyla eklendi');
    refresh();
    return member;
  }, [refresh]);

  const updateMember = useCallback((id: string, data: Partial<DemoMember>) => {
    const store = getDemoStore();
    const member = store.updateMember(id, data);
    if (member) {
      toast.success('Üye başarıyla güncellendi');
      refresh();
    }
    return member;
  }, [refresh]);

  const deleteMember = useCallback((id: string) => {
    const store = getDemoStore();
    store.deleteMember(id);
    toast.success('Üye başarıyla silindi');
    refresh();
  }, [refresh]);

  return { members, loading, refresh, addMember, updateMember, deleteMember };
}

// Groups Hook
export function useGroups() {
  const [groups, setGroups] = useState<DemoGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const store = getDemoStore();
    setGroups(store.getGroups());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addGroup = useCallback((data: Omit<DemoGroup, 'id' | 'created_at' | 'updated_at'>) => {
    const store = getDemoStore();
    const group = store.addGroup(data);
    toast.success('Grup başarıyla oluşturuldu');
    refresh();
    return group;
  }, [refresh]);

  const updateGroup = useCallback((id: string, data: Partial<DemoGroup>) => {
    const store = getDemoStore();
    const group = store.updateGroup(id, data);
    if (group) {
      toast.success('Grup başarıyla güncellendi');
      refresh();
    }
    return group;
  }, [refresh]);

  const deleteGroup = useCallback((id: string) => {
    const store = getDemoStore();
    store.deleteGroup(id);
    toast.success('Grup başarıyla silindi');
    refresh();
  }, [refresh]);

  const getGroupById = useCallback((id: string) => {
    const store = getDemoStore();
    return store.getGroupById(id);
  }, []);

  const getMembersByGroup = useCallback((groupId: string) => {
    const store = getDemoStore();
    return store.getMembersByGroup(groupId);
  }, []);

  return { groups, loading, refresh, addGroup, updateGroup, deleteGroup, getGroupById, getMembersByGroup };
}

// Lessons Hook
export function useLessons() {
  const [lessons, setLessons] = useState<DemoLesson[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const store = getDemoStore();
    setLessons(store.getLessons());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addLesson = useCallback((data: Omit<DemoLesson, 'id' | 'created_at'>) => {
    const store = getDemoStore();
    const lesson = store.addLesson(data);
    toast.success('Ders başarıyla eklendi');
    refresh();
    return lesson;
  }, [refresh]);

  const updateLesson = useCallback((id: string, data: Partial<DemoLesson>) => {
    const store = getDemoStore();
    const lesson = store.updateLesson(id, data);
    if (lesson) {
      toast.success('Ders başarıyla güncellendi');
      refresh();
    }
    return lesson;
  }, [refresh]);

  const deleteLesson = useCallback((id: string) => {
    const store = getDemoStore();
    store.deleteLesson(id);
    toast.success('Ders başarıyla silindi');
    refresh();
  }, [refresh]);

  return { lessons, loading, refresh, addLesson, updateLesson, deleteLesson };
}

// Attendance Hook
export function useAttendance(lessonId?: string) {
  const [attendance, setAttendance] = useState<DemoAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const store = getDemoStore();
    if (lessonId) {
      setAttendance(store.getAttendanceByLesson(lessonId));
    } else {
      setAttendance(store.getAttendance());
    }
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveAttendance = useCallback((lessonId: string, records: { member_id: string; status: 'present' | 'absent' }[]) => {
    const store = getDemoStore();
    const result = store.saveAttendance(lessonId, records);
    toast.success('Yoklama başarıyla kaydedildi');
    refresh();
    return result;
  }, [refresh]);

  return { attendance, loading, refresh, saveAttendance };
}

// Payments Hook
export function usePayments() {
  const [payments, setPayments] = useState<DemoPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const store = getDemoStore();
    setPayments(store.getPayments());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPayment = useCallback((data: Omit<DemoPayment, 'id' | 'created_at'>) => {
    const store = getDemoStore();
    const payment = store.addPayment(data);
    toast.success('Ödeme başarıyla eklendi');
    refresh();
    return payment;
  }, [refresh]);

  const markPaid = useCallback((id: string) => {
    const store = getDemoStore();
    const payment = store.markPaymentPaid(id);
    if (payment) {
      toast.success('Ödeme tamamlandı olarak işaretlendi');
      refresh();
    }
    return payment;
  }, [refresh]);

  const markUnpaid = useCallback((id: string) => {
    const store = getDemoStore();
    const payment = store.markPaymentUnpaid(id);
    if (payment) {
      toast.success('Ödeme bekleniyor olarak işaretlendi');
      refresh();
    }
    return payment;
  }, [refresh]);

  const deletePayment = useCallback((id: string) => {
    const store = getDemoStore();
    store.deletePayment(id);
    toast.success('Ödeme başarıyla silindi');
    refresh();
  }, [refresh]);

  const generatePeriod = useCallback((period: string, amount: number) => {
    const store = getDemoStore();
    const newPayments = store.generatePaymentsForPeriod(period, amount);
    toast.success(`${newPayments.length} yeni ödeme kaydı oluşturuldu`);
    refresh();
    return newPayments;
  }, [refresh]);

  return { payments, loading, refresh, addPayment, markPaid, markUnpaid, deletePayment, generatePeriod };
}

// Inventory Hook
export function useInventory() {
  const [inventory, setInventory] = useState<DemoInventory[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const store = getDemoStore();
    setInventory(store.getInventory());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback((data: Omit<DemoInventory, 'id' | 'created_at' | 'updated_at'>) => {
    const store = getDemoStore();
    const item = store.addInventoryItem(data);
    toast.success('Ekipman başarıyla eklendi');
    refresh();
    return item;
  }, [refresh]);

  const updateItem = useCallback((id: string, data: Partial<DemoInventory>) => {
    const store = getDemoStore();
    const item = store.updateInventoryItem(id, data);
    if (item) {
      toast.success('Ekipman başarıyla güncellendi');
      refresh();
    }
    return item;
  }, [refresh]);

  const deleteItem = useCallback((id: string) => {
    const store = getDemoStore();
    store.deleteInventoryItem(id);
    toast.success('Ekipman başarıyla silindi');
    refresh();
  }, [refresh]);

  const addStock = useCallback((id: string, amount: number) => {
    const store = getDemoStore();
    const item = store.getInventoryById(id);
    if (item) {
      store.updateInventoryItem(id, { quantity: item.quantity + amount });
      toast.success(`${amount} adet stok eklendi`);
      refresh();
    }
  }, [refresh]);

  const removeStock = useCallback((id: string, amount: number) => {
    const store = getDemoStore();
    const item = store.getInventoryById(id);
    if (item) {
      store.updateInventoryItem(id, { quantity: Math.max(0, item.quantity - amount) });
      toast.success(`${amount} adet stok çıkarıldı`);
      refresh();
    }
  }, [refresh]);

  return { inventory, loading, refresh, addItem, updateItem, deleteItem, addStock, removeStock };
}

