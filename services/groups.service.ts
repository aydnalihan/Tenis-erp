import { createClient } from '@/lib/supabase/client';
import type { Group, GroupFormData, GroupWithMembers, ApiResponse, PaginatedResponse, FilterParams } from '@/types';

const supabase = createClient();

export const groupsService = {
  // Get all groups
  async getAll(params?: FilterParams): Promise<PaginatedResponse<GroupWithMembers>> {
    const { search, page = 1, pageSize = 20, sortBy = 'name', sortOrder = 'asc' } = params || {};
    
    let query = supabase
      .from('groups')
      .select(`
        *,
        coach:profiles(*),
        members(count)
      `, { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as GroupWithMembers[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  // Get single group by ID
  async getById(id: string): Promise<ApiResponse<GroupWithMembers>> {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        coach:profiles(*),
        members(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as GroupWithMembers, error: null, success: true };
  },

  // Create new group
  async create(groupData: GroupFormData): Promise<ApiResponse<Group>> {
    const { data, error } = await supabase
      .from('groups')
      .insert(groupData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Group, error: null, success: true };
  },

  // Update group
  async update(id: string, groupData: Partial<GroupFormData>): Promise<ApiResponse<Group>> {
    const { data, error } = await supabase
      .from('groups')
      .update(groupData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Group, error: null, success: true };
  },

  // Delete group
  async delete(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true };
  },

  // Add member to group
  async addMember(groupId: string, memberId: string): Promise<ApiResponse<null>> {
    const { error } = await supabase
      .from('members')
      .update({ group_id: groupId })
      .eq('id', memberId);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true };
  },

  // Remove member from group
  async removeMember(memberId: string): Promise<ApiResponse<null>> {
    const { error } = await supabase
      .from('members')
      .update({ group_id: null })
      .eq('id', memberId);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true };
  },

  // Get group lessons
  async getLessons(groupId: string): Promise<ApiResponse<any[]>> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('group_id', groupId)
      .order('date', { ascending: true });

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data, error: null, success: true };
  },
};

