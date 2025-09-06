import { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Product, ProductFormData } from '@/types/product';
import { ProductForm } from '@/components/ProductForm';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const loadedProducts = await productService.getAll();
    setProducts(loadedProducts);
  };

  const handleSaveProduct = async (data: ProductFormData) => {
    let savedProduct: Product | null;
    
    if (editingProduct) {
      savedProduct = await productService.update(editingProduct.id, data);
    } else {
      savedProduct = await productService.create(data);
    }
    
    if (savedProduct) {
      toast.success(editingProduct ? 'Produto atualizado!' : 'Produto adicionado!');
      setShowForm(false);
      setEditingProduct(null);
      loadProducts();
    } else {
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async () => {
    if (deleteId) {
      const success = await productService.delete(deleteId);
      if (success) {
        toast.success('Produto removido!');
        setDeleteId(null);
        loadProducts();
      } else {
        toast.error('Erro ao remover produto');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleManageVariants = (productId: string) => {
    navigate(`/admin/products/${productId}/variants`);
  };

  return (
    <Layout title="Gerenciar Produtos">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Gerencie seus produtos e suas variações
          </p>
          
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-country hover:opacity-90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          )}
        </div>

        {showForm ? (
          <div className="max-w-2xl">
            <ProductForm
              product={editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          </div>
        ) : (
          <Card className="border-primary/30">
            <CardContent className="p-0">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum produto cadastrado.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Clique em "Novo Produto" para começar.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary/30">
                      <TableHead>Imagem</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço Base</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Variações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="border-primary/30">
                        <TableCell>
                          <div className="h-16 w-16 rounded overflow-hidden bg-muted">
                            <img
                              src={product.imageUrl || '/placeholder.svg'}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.inStock ? "default" : "secondary"}
                            className={product.inStock 
                              ? "bg-moss text-primary-foreground" 
                              : "bg-muted text-muted-foreground"
                            }
                          >
                            {product.inStock ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                            {product.inStock ? 'Disponível' : 'Indisponível'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManageVariants(product.id)}
                            className="border-primary/30"
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Gerenciar
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                              className="border-primary/30"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteId(product.id)}
                              className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}