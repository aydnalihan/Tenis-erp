import { createClient } from '@/lib/supabase/client';
import type { InventoryItem, InventoryFormData, ApiResponse, FilterParams } from '@/types';

const supabase = createClient();

export const inventoryService = {
  // Get all inventory items
  async getAll(params?: FilterParams): Promise<ApiResponse<InventoryItem[]>> {
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
    const { data, error } = await supabase
      .from('inventory')
      .insert(itemData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Update item
  async update(id: string, itemData: Partial<InventoryFormData>): Promise<ApiResponse<InventoryItem>> {
    const { data, error } = await supabase
      .from('inventory')
      .update(itemData)
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
    const { data: current, error: fetchError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchError) {
      return { data: null, error: fetchError.message, success: false };
    }

    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: current.quantity + amount })
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
    const { data: current, error: fetchError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchError) {
      return { data: null, error: fetchError.message, success: false };
    }

    const newQuantity = Math.max(0, current.quantity - amount);

    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity })
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
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .lt('quantity', supabase.rpc('get_min_stock'))
      .order('quantity', { ascending: true });

    // Alternative approach without RPC:
    const { data: allItems, error: allError } = await supabase
      .from('inventory')
      .select('*');

    if (allError) {
      return { data: null, error: allError.message, success: false };
    }

    const lowStockItems = allItems.filter((item: any) => item.quantity < item.min_stock);

    return { data: lowStockItems as InventoryItem[], error: null, success: true };
  },
};

