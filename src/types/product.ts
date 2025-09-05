export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: 'masculino' | 'feminino' | 'unissex' | 'acessorios';
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size?: string;
  color?: string;
  internal_code?: string;
  manufacturer_code?: string;
  ean_code?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface StockMovement {
  id: string;
  variant_id: string;
  movement_type: 'entrada_compra' | 'entrada_ajuste' | 'saida_venda' | 'saida_ajuste' | 'devolucao';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_id?: string;
  notes?: string;
  user_id?: string;
  created_at: string;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;