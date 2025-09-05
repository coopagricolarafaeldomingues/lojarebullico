import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/cart';

export interface CreateSaleData {
  items: CartItem[];
  total: number;
  paymentMethod: 'dinheiro' | 'cartao' | 'pix';
  cashReceived?: number;
  changeAmount?: number;
}

export const saleService = {
  async create(saleData: CreateSaleData) {
    try {
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Criar a venda
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          total: saleData.total,
          payment_method: saleData.paymentMethod,
          cash_received: saleData.cashReceived,
          change_amount: saleData.changeAmount,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Criar os itens da venda
      const saleItems = saleData.items.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      return { success: true, sale };
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao processar venda' 
      };
    }
  },

  async getAll() {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (
              name,
              category
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      return [];
    }
  },

  async getTodaySales() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendas do dia:', error);
      return [];
    }
  },

  async getSalesByDateRange(startDate: Date, endDate: Date) {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (
              name,
              category
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendas por período:', error);
      return [];
    }
  }
};