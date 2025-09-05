import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { PaymentMethod } from '@/types/payment';
import { paymentService } from '@/services/paymentService';
import { CreditCard, DollarSign, Smartphone, UserCheck, Calculator } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirm: (payments: PaymentData[]) => void;
  enableRounding?: boolean;
}

export interface PaymentData {
  paymentMethodId: string;
  amount: number;
  installments: number;
  feeAmount: number;
  netAmount: number;
}

export function PaymentModal({ open, onOpenChange, total: originalTotal, onConfirm, enableRounding = false }: PaymentModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<PaymentData[]>([]);
  const [cashReceived, setCashReceived] = useState('');
  const [installments, setInstallments] = useState(1);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  
  const total = enableRounding ? paymentService.roundToNearest(originalTotal, 0.05) : originalTotal;
  const remainingAmount = total - selectedPayments.reduce((sum, p) => sum + p.amount, 0);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    const methods = await paymentService.getPaymentMethods();
    setPaymentMethods(methods);
    if (methods.length > 0) {
      setSelectedMethodId(methods[0].id);
    }
  };

  const getSelectedMethod = () => {
    return paymentMethods.find(m => m.id === selectedMethodId);
  };

  const calculateChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - remainingAmount);
  };

  const addPayment = (methodId: string, amount: number, installmentCount: number = 1) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;

    const installmentInfo = paymentService.calculateInstallments(amount, method, installmentCount);
    const fees = paymentService.calculateFees(amount, method);

    const payment: PaymentData = {
      paymentMethodId: methodId,
      amount: amount,
      installments: installmentCount,
      feeAmount: fees.feeAmount,
      netAmount: fees.netAmount
    };

    setSelectedPayments([...selectedPayments, payment]);
    setCashReceived('');
    setInstallments(1);
  };

  const handleCashPayment = () => {
    const method = paymentMethods.find(m => m.type === 'dinheiro');
    if (!method) return;

    const received = parseFloat(cashReceived) || 0;
    if (received >= remainingAmount) {
      addPayment(method.id, remainingAmount);
    }
  };

  const handleCardPayment = () => {
    const method = getSelectedMethod();
    if (!method || remainingAmount <= 0) return;
    
    addPayment(method.id, remainingAmount, installments);
  };

  const handlePixPayment = () => {
    const method = paymentMethods.find(m => m.type === 'pix');
    if (!method) return;
    
    addPayment(method.id, remainingAmount);
  };

  const handleFiadoPayment = () => {
    const method = paymentMethods.find(m => m.type === 'fiado');
    if (!method) return;
    
    addPayment(method.id, remainingAmount);
  };

  const handleConfirm = () => {
    if (remainingAmount <= 0.01) { // Tolerância para arredondamento
      onConfirm(selectedPayments);
      setSelectedPayments([]);
      setCashReceived('');
      setInstallments(1);
    }
  };

  const removePayment = (index: number) => {
    setSelectedPayments(selectedPayments.filter((_, i) => i !== index));
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'dinheiro': return <DollarSign className="h-4 w-4" />;
      case 'cartao_credito':
      case 'cartao_debito': return <CreditCard className="h-4 w-4" />;
      case 'pix': return <Smartphone className="h-4 w-4" />;
      case 'fiado': return <UserCheck className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Total da compra:</span>
              <span className="text-2xl font-bold text-primary">
                R$ {total.toFixed(2)}
              </span>
            </div>
            {enableRounding && originalTotal !== total && (
              <p className="text-xs text-muted-foreground">
                *Valor arredondado de R$ {originalTotal.toFixed(2)}
              </p>
            )}
            {remainingAmount > 0 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <span className="text-sm font-medium">Restante:</span>
                <span className="text-lg font-bold text-orange-600">
                  R$ {remainingAmount.toFixed(2)}
                </span>
              </div>
            )}
          </Card>

          {/* Pagamentos adicionados */}
          {selectedPayments.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium mb-2">Pagamentos:</h3>
              <div className="space-y-2">
                {selectedPayments.map((payment, index) => {
                  const method = paymentMethods.find(m => m.id === payment.paymentMethodId);
                  return (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        {method && getPaymentIcon(method.type)}
                        <span className="text-sm">{method?.name}</span>
                        {payment.installments > 1 && (
                          <span className="text-xs text-muted-foreground">
                            ({payment.installments}x)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">R$ {payment.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePayment(index)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Formas de pagamento */}
          <Tabs defaultValue="dinheiro" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dinheiro">Dinheiro</TabsTrigger>
              <TabsTrigger value="cartao">Cartão</TabsTrigger>
              <TabsTrigger value="pix">PIX</TabsTrigger>
              <TabsTrigger value="fiado">Fiado</TabsTrigger>
            </TabsList>

            <TabsContent value="dinheiro" className="space-y-4">
              <div>
                <Label>Valor recebido</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
              </div>
              {cashReceived && parseFloat(cashReceived) >= remainingAmount && (
                <Card className="p-3 bg-green-50">
                  <p className="text-sm text-muted-foreground">Troco:</p>
                  <p className="text-xl font-bold text-green-700">
                    R$ {calculateChange().toFixed(2)}
                  </p>
                </Card>
              )}
              <Button
                className="w-full"
                onClick={handleCashPayment}
                disabled={!cashReceived || parseFloat(cashReceived) < remainingAmount}
              >
                Adicionar Pagamento
              </Button>
            </TabsContent>

            <TabsContent value="cartao" className="space-y-4">
              <div>
                <Label>Tipo de cartão</Label>
                <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods
                      .filter(m => m.type === 'cartao_credito' || m.type === 'cartao_debito')
                      .map(method => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {getSelectedMethod()?.type === 'cartao_credito' && (
                <div>
                  <Label>Parcelas</Label>
                  <Select value={installments.toString()} onValueChange={(v) => setInstallments(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: getSelectedMethod()?.max_installments || 1 }, (_, i) => i + 1).map(n => {
                        const method = getSelectedMethod();
                        if (!method) return null;
                        const info = paymentService.calculateInstallments(remainingAmount, method, n);
                        return (
                          <SelectItem key={n} value={n.toString()}>
                            {n}x de R$ {info.installmentValue.toFixed(2)}
                            {n > 1 && method.interest_rate > 0 && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (Total: R$ {info.totalWithInterest.toFixed(2)})
                              </span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {getSelectedMethod() && (
                <Card className="p-3 bg-muted">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Taxa:</span>
                      <span>{getSelectedMethod()?.fee_percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor da taxa:</span>
                      <span>R$ {paymentService.calculateFees(remainingAmount, getSelectedMethod()!).feeAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Valor líquido:</span>
                      <span>R$ {paymentService.calculateFees(remainingAmount, getSelectedMethod()!).netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              )}

              <Button className="w-full" onClick={handleCardPayment}>
                Adicionar Pagamento
              </Button>
            </TabsContent>

            <TabsContent value="pix" className="space-y-4">
              <Card className="p-4 text-center">
                <Smartphone className="h-12 w-12 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Aguardando confirmação do PIX
                </p>
                <p className="text-xl font-bold mt-2">
                  R$ {remainingAmount.toFixed(2)}
                </p>
              </Card>
              <Button className="w-full" onClick={handlePixPayment}>
                Confirmar PIX Recebido
              </Button>
            </TabsContent>

            <TabsContent value="fiado" className="space-y-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Venda fiada - Cliente deve estar cadastrado
                </p>
                <p className="text-xl font-bold">
                  R$ {remainingAmount.toFixed(2)}
                </p>
              </Card>
              <Button className="w-full" onClick={handleFiadoPayment}>
                Confirmar Venda Fiada
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={remainingAmount > 0.01}
          >
            Finalizar Venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}