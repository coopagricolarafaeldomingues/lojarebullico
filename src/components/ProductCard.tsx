import { Product } from '@/types/product';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-elevated border-primary/20 bg-card"
      onClick={onClick}
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.imageUrl || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-western text-lg text-foreground line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-2xl font-bold text-primary">
          {formatPrice(product.price)}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant={product.inStock ? "default" : "secondary"}
            className={product.inStock 
              ? "bg-moss text-primary-foreground" 
              : "bg-muted text-muted-foreground"
            }
          >
            {product.inStock ? 'Disponível' : 'Indisponível'}
          </Badge>
          
          <span className="text-xs text-muted-foreground capitalize">
            {product.category}
          </span>
        </div>
      </div>
    </Card>
  );
}