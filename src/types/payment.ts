export interface PaymentMethod {
  id: string;
  name: string;
  type: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'fiado';
  fee_percentage: number;
  is_active: boolean;
  max_installments: number;
  interest_rate: number;
  created_at: string;
  updated_at: string;
}

export interface SalePayment {
  id: string;
  sale_id: string;
  payment_method_id: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  installments: number;
  installment_value?: number;
  created_at: string;
  payment_method?: PaymentMethod;
}

export interface Customer {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  discount_percentage: number;
  credit_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}