import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/payment';

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    return data || [];
  },

  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching customer:', error);
      return null;
    }

    return data;
  },

  async create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return null;
    }

    return data;
  },

  async update(id: string, customer: Partial<Customer>): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      return null;
    }

    return data;
  },

  async searchByDocument(document: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('document', document)
      .single();

    if (error) {
      console.error('Error searching customer by document:', error);
      return null;
    }

    return data;
  }
};