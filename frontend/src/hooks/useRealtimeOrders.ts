import { useEffect, useRef, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';
import type { Order } from '../types';

/**
 * Hook subscribes to Supabase Realtime postgres_changes for the orders table.
 * When any INSERT/UPDATE/DELETE happens, it calls onOrderChange to refresh the list.
 */
export function useRealtimeOrders(onOrderChange: (orders: Order[]) => void) {
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>['channel']> | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useRealtimeOrders] fetch error:', error.message);
        return;
      }
      onOrderChange(data || []);
    } catch (err) {
      console.error('[useRealtimeOrders] error:', err);
    }
  }, [onOrderChange]);

  useEffect(() => {
    const supabase = getSupabase();

    channelRef.current = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Re-fetch all orders on any change
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        const supabase = getSupabase();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchOrders]);

  return { refetch: fetchOrders };
}
