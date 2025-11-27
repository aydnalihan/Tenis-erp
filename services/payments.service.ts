import { createClient } from '@/lib/supabase/client';
import type { Payment, PaymentFormData, PaymentWithMember, ApiResponse, PaymentFilterParams } from '@/types';
import type { Database } from '@/lib/supabase';

type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

// Lazy initialization - client is created when first needed
function getSupabaseClient() {
  return createClient();
}

export const paymentsService = {
  // Get payments with filters
  async getAll(params?: PaymentFilterParams): Promise<ApiResponse<PaymentWithMember[]>> {
    const { search, period, paid, page = 1, pageSize = 50 } = params || {};
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('payments')
      .select(`
        *,
        member:members(*)
      `)
      .order('period', { ascending: false })
      .order('paid', { ascending: true });

    if (period) {
      query = query.eq('period', period);
    }
    if (paid !== undefined) {
      query = query.eq('paid', paid);
    }
    if (search) {
      query = query.or(`member.name.ilike.%${search}%,member.surname.ilike.%${search}%`);
    }

    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as PaymentWithMember[], error: null, success: true };
  },

  // Create payment record
  async create(paymentData: PaymentFormData): Promise<ApiResponse<Payment>> {
    const supabase = getSupabaseClient();
    const insertData: PaymentInsert = {
      member_id: paymentData.member_id,
      period: paymentData.period,
      amount: paymentData.amount,
      paid: paymentData.paid || false,
      paid_at: paymentData.paid ? new Date().toISOString() : null,
      notes: 'notes' in paymentData ? ((paymentData as PaymentFormData & { notes?: string }).notes || null) : null,
    };
    // Type assertion needed because Supabase type inference fails for insert() with complex schemas
    type PaymentQueryBuilder = {
      insert: (values: PaymentInsert) => {
        select: () => {
          single: () => Promise<{ data: Database['public']['Tables']['payments']['Row'] | null; error: { message: string } | null }>;
        };
      };
    };
    const { data, error } = await (supabase.from('payments') as unknown as PaymentQueryBuilder)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Payment, error: null, success: true };
  },

  // Mark payment as paid
  async markAsPaid(id: string): Promise<ApiResponse<Payment>> {
    const supabase = getSupabaseClient();
    const updateData: PaymentUpdate = {
      paid: true,
      paid_at: new Date().toISOString(),
    };
    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type PaymentQueryBuilder = {
      update: (values: PaymentUpdate) => {
        eq: (column: string, value: string) => {
          select: () => {
            single: () => Promise<{ data: Database['public']['Tables']['payments']['Row'] | null; error: { message: string } | null }>;
          };
        };
      };
    };
    const { data, error } = await (supabase.from('payments') as unknown as PaymentQueryBuilder)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Payment, error: null, success: true };
  },

  // Mark payment as unpaid
  async markAsUnpaid(id: string): Promise<ApiResponse<Payment>> {
    const supabase = getSupabaseClient();
    const updateData: PaymentUpdate = {
      paid: false,
      paid_at: null,
    };
    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type PaymentQueryBuilder = {
      update: (values: PaymentUpdate) => {
        eq: (column: string, value: string) => {
          select: () => {
            single: () => Promise<{ data: Database['public']['Tables']['payments']['Row'] | null; error: { message: string } | null }>;
          };
        };
      };
    };
    const { data, error } = await (supabase.from('payments') as unknown as PaymentQueryBuilder)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Payment, error: null, success: true };
  },

  // Delete payment
  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true };
  },

  // Generate payments for a period (for all active members)
  async generatePeriod(period: string, defaultAmount: number): Promise<ApiResponse<Payment[]>> {
    const supabase = getSupabaseClient();
    // Get all active members
    // Type assertion needed because Supabase type inference fails for select() with complex schemas
    type MemberSelectBuilder = {
      select: (columns: string) => {
        eq: (column: string, value: string) => Promise<{ data: { id: string }[] | null; error: { message: string } | null }>;
      };
    };
    const { data: members, error: membersError } = await (supabase.from('members') as unknown as MemberSelectBuilder)
      .select('id')
      .eq('status', 'active');

    if (membersError || !members) {
      return { data: null, error: membersError?.message || 'Members not found', success: false };
    }

    // Create payment records
    const paymentRecords: PaymentInsert[] = members.map(member => ({
      member_id: member.id,
      period,
      amount: defaultAmount,
      paid: false,
      paid_at: null,
      notes: null,
    }));

    // Type assertion needed because Supabase type inference fails for upsert() with complex schemas
    type PaymentQueryBuilder = {
      upsert: (
        values: PaymentInsert[],
        options?: { onConflict?: string; ignoreDuplicates?: boolean }
      ) => {
        select: () => Promise<{ data: PaymentInsert[] | null; error: { message: string } | null }>;
      };
    };
    const { data, error } = await (supabase.from('payments') as unknown as PaymentQueryBuilder)
      .upsert(paymentRecords, {
        onConflict: 'member_id,period',
        ignoreDuplicates: true,
      })
      .select();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Payment[], error: null, success: true };
  },

  // Get overdue payments
  async getOverdue(): Promise<ApiResponse<PaymentWithMember[]>> {
    const supabase = getSupabaseClient();
    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        member:members(*)
      `)
      .eq('paid', false)
      .lt('period', currentPeriod)
      .order('period', { ascending: true });

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as PaymentWithMember[], error: null, success: true };
  },

  // Get payment statistics for a period
  async getStats(period: string): Promise<ApiResponse<any>> {
    const supabase = getSupabaseClient();
    // Type assertion needed because Supabase type inference fails for select() with complex schemas
    type PaymentSelectBuilder = {
      select: (columns: string) => {
        eq: (column: string, value: string) => Promise<{ data: { amount: number; paid: boolean }[] | null; error: { message: string } | null }>;
      };
    };
    const { data, error } = await (supabase.from('payments') as unknown as PaymentSelectBuilder)
      .select('amount, paid')
      .eq('period', period);

    if (error || !data) {
      return { data: null, error: error?.message || 'Data not found', success: false };
    }

    const stats = {
      total: data.length,
      paid: data.filter(p => p.paid).length,
      pending: data.filter(p => !p.paid).length,
      totalAmount: data.reduce((sum, p) => sum + p.amount, 0),
      paidAmount: data.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: data.filter(p => !p.paid).reduce((sum, p) => sum + p.amount, 0),
    };

    return { data: stats, error: null, success: true };
  },
};

