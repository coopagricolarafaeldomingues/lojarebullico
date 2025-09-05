import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { productService } from '@/services/productService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { CartItem } from '@/types/cart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function PDV() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao'>('dinheiro');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const loadedProducts = await productService.getAll();
    setProducts(loadedProducts);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return received - calculateTotal();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar",
        variant: "destructive"
      });
      return;
    }
    setCheckoutOpen(true);
  };

  const finalizeSale = () => {
    // Aqui você pode adicionar a lógica para salvar a venda no banco
    toast({
      title: "Venda finalizada",
      description: `Venda de R$ ${calculateTotal().toFixed(2)} finalizada com sucesso!`,
    });
    
    clearCart();
    setCashReceived('');
    setCheckoutOpen(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'todos' || product.category === categoryFilter;
    return matchesSearch && matchesCategory && product.inStock;
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* Produtos */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="unissex">Unissex</SelectItem>
                  <SelectItem value="acessorios">Acessórios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="p-3 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => addToCart(product)}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                    <p className="text-primary font-bold">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Carrinho */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho
              </h2>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <ScrollArea className="h-[calc(100vh-400px)]">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Carrinho vazio
                </p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm">{item.product.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold text-primary">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {calculateTotal().toFixed(2)}
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Finalizar Venda
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Checkout */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total da compra</p>
              <p className="text-2xl font-bold text-primary">
                R$ {calculateTotal().toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Forma de pagamento</p>
              <Select value={paymentMethod} onValueChange={(value: 'dinheiro' | 'cartao') => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Dinheiro
                    </div>
                  </SelectItem>
                  <SelectItem value="cartao">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Cartão
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === 'dinheiro' && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Valor recebido</p>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                  />
                </div>

                {cashReceived && parseFloat(cashReceived) >= calculateTotal() && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Troco</p>
                    <p className="text-xl font-bold text-primary">
                      R$ {calculateChange().toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={finalizeSale}
              disabled={paymentMethod === 'dinheiro' && parseFloat(cashReceived) < calculateTotal()}
            >
              Confirmar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}