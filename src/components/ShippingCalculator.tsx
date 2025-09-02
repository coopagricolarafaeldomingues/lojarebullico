import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Package, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ShippingOption {
  service: string;
  price: number;
  deliveryTime: string;
}

export function ShippingCalculator() {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [error, setError] = useState('');

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    if (formatted.replace(/\D/g, '').length <= 8) {
      setCep(formatted);
    }
  };

  const calculateShipping = async () => {
    setError('');
    setShippingOptions([]);
    
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return;
    }

    setLoading(true);

    try {
      // Primeiro, vamos buscar informações do CEP para validação
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        setLoading(false);
        return;
      }

      // Simulação de cálculo de frete baseado na região
      // Em produção, você integraria com a API dos Correios ou Melhor Envio
      const basePrice = 15.00;
      const region = data.uf;
      
      // Ajuste de preço baseado na região (simulação)
      let priceMultiplier = 1;
      if (['SP', 'RJ', 'MG', 'ES'].includes(region)) {
        priceMultiplier = 1;
      } else if (['PR', 'SC', 'RS'].includes(region)) {
        priceMultiplier = 1.2;
      } else if (['GO', 'MT', 'MS', 'DF'].includes(region)) {
        priceMultiplier = 1.3;
      } else {
        priceMultiplier = 1.5;
      }

      const options: ShippingOption[] = [
        {
          service: 'PAC - Correios',
          price: basePrice * priceMultiplier,
          deliveryTime: '5-8 dias úteis'
        },
        {
          service: 'SEDEX - Correios',
          price: (basePrice * 1.8) * priceMultiplier,
          deliveryTime: '2-3 dias úteis'
        },
        {
          service: 'SEDEX 10 - Correios',
          price: (basePrice * 2.5) * priceMultiplier,
          deliveryTime: '1 dia útil'
        }
      ];

      setShippingOptions(options);
    } catch (err) {
      setError('Erro ao calcular frete. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-western text-xl">
          <Package className="h-5 w-5 text-primary" />
          Calcular Frete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cep" className="text-sm font-medium">
            Digite seu CEP
          </Label>
          <div className="flex gap-2">
            <Input
              id="cep"
              type="text"
              placeholder="00000-000"
              value={cep}
              onChange={handleCepChange}
              className="flex-1 border-primary/30 focus:border-primary"
            />
            <Button
              onClick={calculateShipping}
              disabled={loading}
              variant="default"
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <span className="animate-pulse">Calculando...</span>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {shippingOptions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Opções de envio:
            </h3>
            {shippingOptions.map((option, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-primary/20 bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {option.service}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.deliveryTime}
                    </p>
                  </div>
                  <p className="font-bold text-primary">
                    R$ {option.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}