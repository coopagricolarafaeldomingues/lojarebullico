-- Criar tabela de variações de produtos (grade)
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  size TEXT,
  color TEXT,
  internal_code TEXT,
  manufacturer_code TEXT,
  ean_code TEXT UNIQUE,
  price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de movimentações de estoque
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL REFERENCES public.product_variants ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada_compra', 'entrada_ajuste', 'saida_venda', 'saida_ajuste', 'devolucao')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reference_id UUID, -- ID da venda, compra ou ajuste
  notes TEXT,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de formas de pagamento
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'fiado')),
  fee_percentage NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  max_installments INTEGER DEFAULT 1,
  interest_rate NUMERIC(5,2) DEFAULT 0, -- Taxa de juros mensal
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pagamentos das vendas
CREATE TABLE public.sale_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods ON DELETE RESTRICT,
  amount NUMERIC(10,2) NOT NULL,
  fee_amount NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(10,2) NOT NULL,
  installments INTEGER DEFAULT 1,
  installment_value NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT UNIQUE, -- CPF/CNPJ
  email TEXT,
  phone TEXT,
  address TEXT,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  credit_limit NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alterar tabela de vendas para suportar novos campos
ALTER TABLE public.sales 
ADD COLUMN customer_id UUID REFERENCES public.customers ON DELETE SET NULL,
ADD COLUMN discount_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
ADD COLUMN fee_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN net_total NUMERIC(10,2) NOT NULL DEFAULT 0,
ADD COLUMN is_return BOOLEAN DEFAULT false,
ADD COLUMN original_sale_id UUID REFERENCES public.sales ON DELETE SET NULL,
ADD COLUMN receipt_number SERIAL,
ADD COLUMN notes TEXT;

-- Alterar tabela de itens da venda para suportar variantes
ALTER TABLE public.sale_items
ADD COLUMN variant_id UUID REFERENCES public.product_variants ON DELETE RESTRICT,
ADD COLUMN discount_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN discount_percentage NUMERIC(5,2) DEFAULT 0;

-- Adicionar índices para melhor performance
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_ean ON public.product_variants(ean_code);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_stock_movements_variant_id ON public.stock_movements(variant_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at DESC);
CREATE INDEX idx_sale_payments_sale_id ON public.sale_payments(sale_id);
CREATE INDEX idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX idx_sales_receipt_number ON public.sales(receipt_number);

-- Habilitar RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para product_variants
CREATE POLICY "Anyone can view active product variants" 
ON public.product_variants FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage product variants" 
ON public.product_variants FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Políticas RLS para stock_movements
CREATE POLICY "Authenticated users can view stock movements" 
ON public.stock_movements FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create stock movements" 
ON public.stock_movements FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas RLS para payment_methods
CREATE POLICY "Anyone can view active payment methods" 
ON public.payment_methods FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage payment methods" 
ON public.payment_methods FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Políticas RLS para sale_payments
CREATE POLICY "Authenticated users can view sale payments" 
ON public.sale_payments FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create sale payments" 
ON public.sale_payments FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas RLS para customers
CREATE POLICY "Authenticated users can view customers" 
ON public.customers FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage customers" 
ON public.customers FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir formas de pagamento padrão
INSERT INTO public.payment_methods (name, type, fee_percentage, max_installments) VALUES
('Dinheiro', 'dinheiro', 0, 1),
('Cartão de Crédito', 'cartao_credito', 2.5, 12),
('Cartão de Débito', 'cartao_debito', 1.5, 1),
('PIX', 'pix', 0, 1),
('Fiado', 'fiado', 0, 1);