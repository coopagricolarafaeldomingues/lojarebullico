import { supabase } from '@/integrations/supabase/client';
import { Product, ProductFormData } from '@/types/product';

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }

    return data?.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description || '',
      imageUrl: item.image_url || '',
      category: item.category as 'masculino' | 'feminino' | 'unissex' | 'acessorios',
      inStock: item.in_stock,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || [];
  },

  async create(product: ProductFormData): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        price: product.price,
        description: product.description,
        image_url: product.imageUrl,
        category: product.category,
        in_stock: product.inStock
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description || '',
      imageUrl: data.image_url || '',
      category: data.category as 'masculino' | 'feminino' | 'unissex' | 'acessorios',
      inStock: data.in_stock,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async update(id: string, product: ProductFormData): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        price: product.price,
        description: product.description,
        image_url: product.imageUrl,
        category: product.category,
        in_stock: product.inStock
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description || '',
      imageUrl: data.image_url || '',
      category: data.category as 'masculino' | 'feminino' | 'unissex' | 'acessorios',
      inStock: data.in_stock,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar produto:', error);
      return false;
    }

    return true;
  }
};