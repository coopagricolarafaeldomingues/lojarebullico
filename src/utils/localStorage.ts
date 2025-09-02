import { Product } from '@/types/product';

const PRODUCTS_KEY = 'country_store_products';
const ADMIN_KEY = 'country_store_admin';

export const storageUtils = {
  // Products
  getProducts: (): Product[] => {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },
  
  saveProduct: (product: Product): void => {
    const products = storageUtils.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },
  
  deleteProduct: (id: string): void => {
    const products = storageUtils.getProducts().filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },
  
  // Admin Auth (simple password protection)
  isAdminAuthenticated: (): boolean => {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  },
  
  setAdminAuth: (authenticated: boolean): void => {
    if (authenticated) {
      localStorage.setItem(ADMIN_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_KEY);
    }
  }
};