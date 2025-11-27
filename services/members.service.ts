import { createClient } from '@/lib/supabase/client';
import type { Member, MemberFormData, MemberWithGroup, ApiResponse, PaginatedResponse, MemberFilterParams } from '@/types';

const supabase = createClient();

export const membersService = {
  // Get all members with optional filters
  async getAll(params?: MemberFilterParams): Promise<PaginatedResponse<MemberWithGroup>> {
    const { search, page = 1, pageSize = 10, groupId, isChild, sortBy = 'created_at', sortOrder = 'desc' } = params || {};
    
    let query = supabase
      .from('members')
      .select(`
        *,
        group:groups(*)
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,surname.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (groupId) {
      query = query.eq('group_id', groupId);
    }
    if (isChild !== undefined) {
      query = query.eq('is_child', isChild);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as MemberWithGroup[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  // Get single member by ID
  async getById(id: string): Promise<ApiResponse<MemberWithGroup>> {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        group:groups(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as MemberWithGroup, error: null, success: true };
  },

  // Create new member
  async create(memberData: MemberFormData): Promise<ApiResponse<Member>> {
    const { data, error } = await supabase
      .from('members')
      .insert(memberData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Member, error: null, success: true };
  },

  // Update member
  async update(id: string, memberData: Partial<MemberFormData>): Promise<ApiResponse<Member>> {
    const { data, error } = await supabase
      .from('members')
      .update(memberData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Member, error: null, success: true };
  },

  // Delete member
  async delete(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true };
  },

  // Get member attendance history
  async getAttendance(memberId: string): Promise<ApiResponse<any[]>> {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        lesson:lessons(*)
      `)
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data, error: null, success: true };
  },

  // Get member payment history
  async getPayments(memberId: string): Promise<ApiResponse<any[]>> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('member_id', memberId)
      .order('period', { ascending: false });

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data, error: null, success: true };
  },
};

