import { Product, ProductVariant } from './product';

export interface CartItem {
  product?: Product; // Mantido para compatibilidade
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  discountPercentage?: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'dinheiro' | 'cartao' | 'pix';
  cashReceived?: number;
  change?: number;
  createdAt: string;
  userId?: string;
}