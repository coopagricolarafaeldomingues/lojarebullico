-- Habilitar autenticação por email/senha
-- O Supabase já tem a tabela auth.users configurada

-- Criar tabela de perfis de usuário (opcional, para dados adicionais)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para que usuários possam ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para que usuários possam atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Criar função para criar perfil automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar a função quando um novo usuário é criado
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar tabela de produtos se não existir
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT CHECK (category IN ('masculino', 'feminino', 'unissex', 'acessorios')),
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS na tabela products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam produtos (loja pública)
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

-- Política para permitir que usuários autenticados criem produtos
CREATE POLICY "Authenticated users can create products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir que usuários autenticados atualizem produtos
CREATE POLICY "Authenticated users can update products" ON public.products
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Política para permitir que usuários autenticados deletem produtos
CREATE POLICY "Authenticated users can delete products" ON public.products
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at na tabela products
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at na tabela profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();