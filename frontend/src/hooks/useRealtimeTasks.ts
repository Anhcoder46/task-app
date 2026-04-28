import { useEffect, useRef, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';
import type { Task } from '../types';

/**
 * Hook subscribes to Supabase Realtime postgres_changes for the tasks table.
 * When any INSERT/UPDATE/DELETE happens, it calls onTaskChange to refresh the list.
 */
export function useRealtimeTasks(onTaskChange: (tasks: Task[]) => void) {
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>['channel']> | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useRealtimeTasks] fetch error:', error.message);
        return;
      }
      onTaskChange(data || []);
    } catch (err) {
      console.error('[useRealtimeTasks] error:', err);
    }
  }, [onTaskChange]);

  useEffect(() => {
    const supabase = getSupabase();

    channelRef.current = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          // Re-fetch all tasks on any change
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        const supabase = getSupabase();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchTasks]);

  return { refetch: fetchTasks };
}
