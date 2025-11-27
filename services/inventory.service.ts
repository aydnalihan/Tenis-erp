import { createClient } from '@/lib/supabase/client';
import type { InventoryItem, InventoryFormData, ApiResponse, FilterParams } from '@/types';
import type { Database } from '@/lib/supabase';

type InventoryInsert = Database['public']['Tables']['inventory']['Insert'];
type InventoryUpdate = Database['public']['Tables']['inventory']['Update'];

// Lazy initialization - client is created when first needed
function getSupabaseClient() {
  return createClient();
}

export const inventoryService = {
  // Get all inventory items
  async getAll(params?: FilterParams): Promise<ApiResponse<InventoryItem[]>> {
    const supabase = getSupabaseClient();
    const { search, sortBy = 'name', sortOrder = 'asc' } = params || {};
    
    let query = supabase
      .from('inventory')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem[], error: null, success: true };
  },

  // Get single item
  async getById(id: string): Promise<ApiResponse<InventoryItem>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Create new item
  async create(itemData: InventoryFormData): Promise<ApiResponse<InventoryItem>> {
    const supabase = getSupabaseClient();
    const insertData: InventoryInsert = {
      name: itemData.name,
      category: itemData.category || null,
      quantity: itemData.quantity || 0,
      min_stock: itemData.min_stock || 0,
      description: itemData.description || null,
    };
    // Type assertion needed because Supabase type inference fails for insert() with complex schemas
    type InventoryQueryBuilder = {
      insert: (values: InventoryInsert) => {
        select: () => {
          single: () => Promise<{ data: Database['public']['Tables']['inventory']['Row'] | null; error: { message: string } | null }>;
        };
      };
    };
    const { data, error } = await (supabase.from('inventory') as unknown as InventoryQueryBuilder)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Update item
  async update(id: string, itemData: Partial<InventoryFormData>): Promise<ApiResponse<InventoryItem>> {
    const supabase = getSupabaseClient();
    const updateData: InventoryUpdate = {
      name: itemData.name,
      category: itemData.category !== undefined ? (itemData.category || null) : undefined,
      quantity: itemData.quantity,
      min_stock: itemData.min_stock,
      description: itemData.description !== undefined ? (itemData.description || null) : undefined,
    };
    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type InventoryQueryBuilder = {
      update: (values: InventoryUpdate) => {
        eq: (column: string, value: string) => {
          select: () => {
            single: () => Promise<{ data: Database['public']['Tables']['inventory']['Row'] | null; error: { message: string } | null }>;
          };
        };
      };
    };
    const { data, error } = await (supabase.from('inventory') as unknown as InventoryQueryBuilder)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Delete item
  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true };
  },

  // Add stock
  async addStock(id: string, amount: number): Promise<ApiResponse<InventoryItem>> {
    const supabase = getSupabaseClient();
    // Type assertion needed because Supabase type inference fails for select() with complex schemas
    type InventorySelectBuilder = {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          single: () => Promise<{ data: { quantity: number } | null; error: { message: string } | null }>;
        };
      };
    };
    const { data: current, error: fetchError } = await (supabase.from('inventory') as unknown as InventorySelectBuilder)
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return { data: null, error: fetchError?.message || 'Item not found', success: false };
    }

    const updateData: InventoryUpdate = { quantity: current.quantity + amount };
    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type InventoryQueryBuilder = {
      update: (values: InventoryUpdate) => {
        eq: (column: string, value: string) => {
          select: () => {
            single: () => Promise<{ data: Database['public']['Tables']['inventory']['Row'] | null; error: { message: string } | null }>;
          };
        };
      };
    };
    const { data, error } = await (supabase.from('inventory') as unknown as InventoryQueryBuilder)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Remove stock
  async removeStock(id: string, amount: number): Promise<ApiResponse<InventoryItem>> {
    const supabase = getSupabaseClient();
    // Type assertion needed because Supabase type inference fails for select() with complex schemas
    type InventorySelectBuilder = {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          single: () => Promise<{ data: { quantity: number } | null; error: { message: string } | null }>;
        };
      };
    };
    const { data: current, error: fetchError } = await (supabase.from('inventory') as unknown as InventorySelectBuilder)
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return { data: null, error: fetchError?.message || 'Item not found', success: false };
    }

    const newQuantity = Math.max(0, current.quantity - amount);
    const updateData: InventoryUpdate = { quantity: newQuantity };
    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type InventoryQueryBuilder = {
      update: (values: InventoryUpdate) => {
        eq: (column: string, value: string) => {
          select: () => {
            single: () => Promise<{ data: Database['public']['Tables']['inventory']['Row'] | null; error: { message: string } | null }>;
          };
        };
      };
    };
    const { data, error } = await (supabase.from('inventory') as unknown as InventoryQueryBuilder)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Get low stock items
  async getLowStock(): Promise<ApiResponse<InventoryItem[]>> {
    const supabase = getSupabaseClient();
    
    // Get all items and filter for low stock
    // Type assertion needed because Supabase type inference fails for select() with complex schemas
    type InventorySelectBuilder = {
      select: (columns: string) => Promise<{ data: Database['public']['Tables']['inventory']['Row'][] | null; error: { message: string } | null }>;
    };
    const { data: allItems, error: allError } = await (supabase.from('inventory') as unknown as InventorySelectBuilder)
      .select('*');

    if (allError) {
      return { data: null, error: allError.message, success: false };
    }

    const lowStockItems = (allItems || []).filter((item: Database['public']['Tables']['inventory']['Row']) => item.quantity < (item.min_stock || 0));

    return { data: lowStockItems as InventoryItem[], error: null, success: true };
  },
};

