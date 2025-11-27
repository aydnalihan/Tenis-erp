'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Member, Group } from '@/types';
import { MemberFormValues } from '@/lib/validations/member';
import { toast } from 'sonner';

interface UseMembersOptions {
  search?: string;
  groupId?: string;
  isChild?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

interface MemberWithGroup extends Member {
  group: { id: string; name: string } | null;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function useMembers(options: UseMembersOptions = {}) {
  const [members, setMembers] = useState<MemberWithGroup[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.search) params.set('search', options.search);
      if (options.groupId) params.set('group_id', options.groupId);
      if (options.isChild) params.set('is_child', options.isChild);
      if (options.status) params.set('status', options.status);
      if (options.page) params.set('page', options.page.toString());
      if (options.pageSize) params.set('pageSize', options.pageSize.toString());

      const response = await fetch(`/api/members?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Üyeler yüklenirken hata oluştu');
      }

      setMembers(result.data || []);
      setPagination(result.pagination || pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [options.search, options.groupId, options.isChild, options.status, options.page, options.pageSize]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const createMember = async (data: MemberFormValues): Promise<boolean> => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Üye eklenirken hata oluştu');
      }

      toast.success('Üye başarıyla eklendi');
      await fetchMembers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      toast.error(message);
      return false;
    }
  };

  const updateMember = async (id: string, data: MemberFormValues): Promise<boolean> => {
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Üye güncellenirken hata oluştu');
      }

      toast.success('Üye başarıyla güncellendi');
      await fetchMembers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      toast.error(message);
      return false;
    }
  };

  const deleteMember = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Üye silinirken hata oluştu');
      }

      toast.success('Üye başarıyla silindi');
      await fetchMembers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      toast.error(message);
      return false;
    }
  };

  return {
    members,
    pagination,
    loading,
    error,
    refetch: fetchMembers,
    createMember,
    updateMember,
    deleteMember,
  };
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        const result = await response.json();
        setGroups(result.data || []);
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return { groups, loading };
}

