import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod } from '@/types/payment';

export const paymentService = {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }

    // Cast the type property to the correct union type
    return (data || []).map(method => ({
      ...method,
      type: method.type as PaymentMethod['type']
    }));
  },

  calculateInstallments(total: number, paymentMethod: PaymentMethod, installments: number) {
    if (installments <= 1) {
      return {
        installmentValue: total,
        totalWithInterest: total,
        interestAmount: 0
      };
    }

    const monthlyRate = paymentMethod.interest_rate / 100;
    const totalWithInterest = total * Math.pow(1 + monthlyRate, installments);
    const installmentValue = totalWithInterest / installments;
    const interestAmount = totalWithInterest - total;

    return {
      installmentValue: Math.round(installmentValue * 100) / 100,
      totalWithInterest: Math.round(totalWithInterest * 100) / 100,
      interestAmount: Math.round(interestAmount * 100) / 100
    };
  },

  calculateFees(amount: number, paymentMethod: PaymentMethod) {
    const feeAmount = (amount * paymentMethod.fee_percentage) / 100;
    const netAmount = amount - feeAmount;

    return {
      feeAmount: Math.round(feeAmount * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100
    };
  },

  roundToNearest(value: number, nearest: number = 0.05): number {
    return Math.round(value / nearest) * nearest;
  }
};