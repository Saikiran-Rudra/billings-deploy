'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { Payment } from '@/types';

interface PaymentStats {
  totalToday: number;
  totalThisMonth: number;
  paymentCount: number;
}

interface UsePaymentsReturn {
  payments: Payment[];
  stats: PaymentStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and process payment data
 * - Fetches payments for the authenticated user
 * - Calculates totals for current day and current month
 * - Manages loading and error states
 * - Optimized for performance with memoization
 */
export function usePayments(): UsePaymentsReturn {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch payments from API
   * Includes authorization token automatically via api-client
   */
  const fetchPayments = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch payments from backend API
      const response = await api.get<{ payments: Payment[] }>(
        `/payments`
      );

      console.log('Fetched payments:', response);
      console.log('Current user ID:', user.id);

      // Filter payments by current user ID
      const userPayments = (response.payments || []).filter(
        (payment) => {
          const paymentUserId = payment.userId;
          const matches = paymentUserId === user.id;
          console.log(`Payment ${payment.invoice}: userId=${paymentUserId}, current user=${user.id}, matches=${matches}`);
          return matches;
        }
      );

      console.log('Filtered payments for user:', userPayments);
      setPayments(userPayments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments';
      setError(errorMessage);
      console.error('Payment fetch error:', err);
      // Set empty array on error to show 0
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Fetch payments on component mount and when user changes
   */
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  /**
   * Calculate payment statistics
   * Optimized with useMemo to prevent unnecessary recalculations
   */
  const stats: PaymentStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalToday = 0;
    let totalThisMonth = 0;
    let paymentCount = 0;

    payments.forEach((payment) => {
      // Parse date string (YYYY-MM-DD) to avoid timezone issues
      const [year, month, day] = payment.date.split('-').map(Number);
      const paymentDate = new Date(year, month - 1, day);

      console.log(`Processing payment: date=${payment.date}, Amount=${payment.Amount}, parsed=${paymentDate.toDateString()}`);

      // Ensure Amount is a number
      const amount = Number(payment.Amount || 0);

      // Check if payment is from today
      if (paymentDate.getTime() === today.getTime()) {
        console.log(`✓ Payment is from TODAY: ${payment.date}`);
        totalToday += amount;
      }

      // Check if payment is from current month
      if (paymentDate >= monthStart && paymentDate <= now) {
        console.log(`✓ Payment is from THIS MONTH: ${payment.date}`);
        totalThisMonth += amount;
      }

      paymentCount++;
    });

    console.log('Final stats:', { totalToday, totalThisMonth, paymentCount });

    return {
      totalToday: Math.round(totalToday * 100) / 100,
      totalThisMonth: Math.round(totalThisMonth * 100) / 100,
      paymentCount,
    };
  }, [payments]);

  return {
    payments,
    stats,
    isLoading,
    error,
    refetch: fetchPayments,
  };
}
