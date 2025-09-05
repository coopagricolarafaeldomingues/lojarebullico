import { supabase } from '@/integrations/supabase/client';
import { Product, ProductVariant, StockMovement } from '@/types/product';

export const variantService = {
  async getAll() {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*, product:products(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching variants:', error);
      return [];
    }

    return data || [];
  },

  async getByProduct(productId: string) {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching product variants:', error);
      return [];
    }

    return data || [];
  },

  async getByEAN(ean: string): Promise<ProductVariant | null> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*, product:products(*)')
      .eq('ean_code', ean)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching variant by EAN:', error);
      return null;
    }

    if (!data) return null;

    // Transform product data to match Product interface
    const product = data.product ? {
      id: data.product.id,
      name: data.product.name,
      price: data.product.price,
      description: data.product.description,
      imageUrl: data.product.image_url || '',
      category: data.product.category as Product['category'],
      inStock: data.product.in_stock || false,
      createdAt: data.product.created_at,
      updatedAt: data.product.updated_at
    } : undefined;

    return {
      ...data,
      product
    } as ProductVariant;
  },

  async getBySKU(sku: string): Promise<ProductVariant | null> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*, product:products(*)')
      .eq('sku', sku)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching variant by SKU:', error);
      return null;
    }

    if (!data) return null;

    // Transform product data to match Product interface
    const product = data.product ? {
      id: data.product.id,
      name: data.product.name,
      price: data.product.price,
      description: data.product.description,
      imageUrl: data.product.image_url || '',
      category: data.product.category as Product['category'],
      inStock: data.product.in_stock || false,
      createdAt: data.product.created_at,
      updatedAt: data.product.updated_at
    } : undefined;

    return {
      ...data,
      product
    } as ProductVariant;
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*, product:products(*)')
      .eq('is_active', true)
      .or(`sku.ilike.%${query}%,ean_code.ilike.%${query}%,internal_code.ilike.%${query}%`);

    if (error) {
      console.error('Error searching variants:', error);
      return [];
    }

    return data || [];
  },

  async updateStock(variantId: string, quantity: number, movementType: StockMovement['movement_type'], referenceId?: string, notes?: string) {
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variantId)
      .single();

    if (variantError || !variant) {
      console.error('Error fetching variant:', variantError);
      return { success: false, error: 'Variante não encontrada' };
    }

    const previousStock = variant.stock_quantity;
    const newStock = movementType.startsWith('entrada') || movementType === 'devolucao'
      ? previousStock + quantity
      : previousStock - quantity;

    if (newStock < 0) {
      return { success: false, error: 'Estoque insuficiente' };
    }

    // Atualizar estoque
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock_quantity: newStock })
      .eq('id', variantId);

    if (updateError) {
      console.error('Error updating stock:', updateError);
      return { success: false, error: 'Erro ao atualizar estoque' };
    }

    // Registrar movimentação
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        variant_id: variantId,
        movement_type: movementType,
        quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        reference_id: referenceId,
        notes,
        user_id: user?.id
      });

    if (movementError) {
      console.error('Error creating stock movement:', movementError);
      // Reverter atualização de estoque se falhar ao criar movimentação
      await supabase
        .from('product_variants')
        .update({ stock_quantity: previousStock })
        .eq('id', variantId);
      return { success: false, error: 'Erro ao registrar movimentação' };
    }

    return { success: true, newStock };
  },

  async checkLowStock() {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*, product:products(name)')
      .lte('stock_quantity', 'min_stock')
      .eq('is_active', true);

    if (error) {
      console.error('Error checking low stock:', error);
      return [];
    }

    return data || [];
  }
};