import { Product } from '@/types/product';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${product.name} - ${formatPrice(product.price)}`
    );
    const phoneNumber = '5511999999999'; // Substitua pelo número real
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-primary/30">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-square md:aspect-auto bg-muted">
            <img
              src={product.imageUrl || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h2 className="font-western text-3xl text-foreground mb-2">
                {product.name}
              </h2>
              <p className="text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="flex gap-3">
              <Badge 
                variant={product.inStock ? "default" : "secondary"}
                className={product.inStock 
                  ? "bg-moss text-primary-foreground px-4 py-1" 
                  : "bg-muted text-muted-foreground px-4 py-1"
                }
              >
                {product.inStock ? 'Disponível' : 'Indisponível'}
              </Badge>
              <Badge variant="outline" className="px-4 py-1 capitalize border-primary/30">
                {product.category}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="font-western text-lg text-foreground">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'Produto de alta qualidade, estilo country autêntico.'}
              </p>
            </div>

            <Button
              onClick={handleWhatsApp}
              disabled={!product.inStock}
              className="w-full bg-gradient-country hover:opacity-90 text-primary-foreground py-6 text-lg font-semibold transition-all"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Comprar via WhatsApp
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Clique no botão acima para falar conosco e finalizar sua compra
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}