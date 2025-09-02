import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key são necessários. Configure as variáveis de ambiente.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          description: string | null;
          image_url: string | null;
          category: 'masculino' | 'feminino' | 'unissex' | 'acessorios';
          in_stock: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          description?: string | null;
          image_url?: string | null;
          category: 'masculino' | 'feminino' | 'unissex' | 'acessorios';
          in_stock?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          description?: string | null;
          image_url?: string | null;
          category?: 'masculino' | 'feminino' | 'unissex' | 'acessorios';
          in_stock?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};