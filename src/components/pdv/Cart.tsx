import { CartItem } from '@/types/cart';
import { ProductVariant } from '@/types/product';
import { Customer } from '@/types/payment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, Percent, User } from 'lucide-react';
import { useState } from 'react';

interface CartProps {
  items: CartItem[];
  customer?: Customer | null;
  discountAmount: number;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemoveItem: (variantId: string) => void;
  onClear: () => void;
  onUpdateItemPrice: (variantId: string, price: number) => void;
  onUpdateItemDiscount: (variantId: string, discount: number) => void;
  onUpdateTotalDiscount: (discount: number) => void;
  onSelectCustomer: () => void;
}

export function Cart({
  items,
  customer,
  discountAmount,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
  onUpdateItemPrice,
  onUpdateItemDiscount,
  onUpdateTotalDiscount,
  onSelectCustomer
}: CartProps) {
  const [totalDiscountInput, setTotalDiscountInput] = useState(discountAmount.toString());
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const itemTotal = (item.unitPrice - (item.discountAmount || 0)) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const total = Math.max(0, subtotal - discountAmount);

  const handleTotalDiscountChange = (value: string) => {
    setTotalDiscountInput(value);
    const discount = parseFloat(value) || 0;
    if (discount >= 0) {
      onUpdateTotalDiscount(discount);
    }
  };

  const handlePriceEdit = (variantId: string, value: string) => {
    const price = parseFloat(value) || 0;
    if (price >= 0) {
      onUpdateItemPrice(variantId, price);
      setEditingPrice(null);
    }
  };

  const handleDiscountEdit = (variantId: string, value: string) => {
    const discount = parseFloat(value) || 0;
    if (discount >= 0) {
      onUpdateItemDiscount(variantId, discount);
      setEditingDiscount(null);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho
          </h2>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {customer && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{customer.name}</span>
            {customer.discount_percentage > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                {customer.discount_percentage}% desc.
              </span>
            )}
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={onSelectCustomer}
        >
          {customer ? 'Trocar Cliente' : 'Selecionar Cliente'}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Carrinho vazio
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.variant.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">
                      {item.variant.product?.name || 'Produto'}
                    </h4>
                    {(item.variant.size || item.variant.color) && (
                      <p className="text-xs text-muted-foreground">
                        {item.variant.size && `Tam: ${item.variant.size}`}
                        {item.variant.size && item.variant.color && ' | '}
                        {item.variant.color && `Cor: ${item.variant.color}`}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      SKU: {item.variant.sku}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.variant.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Preço unitário editável */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Preço:</span>
                  {editingPrice === item.variant.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={item.unitPrice}
                      className="w-24 h-7 text-xs"
                      onBlur={(e) => handlePriceEdit(item.variant.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePriceEdit(item.variant.id, e.currentTarget.value);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <button
                      className="font-medium text-sm hover:bg-muted px-2 py-1 rounded"
                      onClick={() => setEditingPrice(item.variant.id)}
                    >
                      R$ {item.unitPrice.toFixed(2)}
                    </button>
                  )}
                </div>

                {/* Desconto por item */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Desconto:</span>
                  {editingDiscount === item.variant.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={item.discountAmount || 0}
                      className="w-24 h-7 text-xs"
                      onBlur={(e) => handleDiscountEdit(item.variant.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleDiscountEdit(item.variant.id, e.currentTarget.value);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <button
                      className="text-sm hover:bg-muted px-2 py-1 rounded flex items-center gap-1"
                      onClick={() => setEditingDiscount(item.variant.id)}
                    >
                      <Percent className="h-3 w-3" />
                      R$ {(item.discountAmount || 0).toFixed(2)}
                    </button>
                  )}
                </div>

                {/* Quantidade */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.variant.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.variant.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-bold text-primary">
                    R$ {((item.unitPrice - (item.discountAmount || 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t space-y-3">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Desconto total:</span>
          <Input
            type="number"
            step="0.01"
            value={totalDiscountInput}
            onChange={(e) => handleTotalDiscountChange(e.target.value)}
            className="w-24 h-8 text-sm text-right"
          />
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-primary">
            R$ {total.toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  );
}