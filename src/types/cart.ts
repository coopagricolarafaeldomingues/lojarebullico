import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
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