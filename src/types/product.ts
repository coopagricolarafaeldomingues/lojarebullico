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

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;