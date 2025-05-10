
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Notification } from '@/types/notification';

export { type Notification } from '@/types/notification';

export function useNotifications() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const {
    data: notifications,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!session?.user) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!session?.user
  });

  // Get unread notifications count
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: async () => {
      if (!session?.user) return 0;
      
      const { data, error } = await supabase
        .rpc('count_unread_notifications', {
          user_id_input: session.user.id
        });
      
      if (error) throw error;
      return data as number;
    },
    enabled: !!session?.user
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
    onError: (error) => {
      toast.error("Failed to mark notification as read");
      console.error('Error marking notification as read:', error);
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.user.id)
        .eq('read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error("Failed to mark all notifications as read");
      console.error('Error marking all notifications as read:', error);
    }
  });

  // Setup realtime subscription for new notifications
  useEffect(() => {
    if (!session?.user) return;
    
    // Subscribe to notifications table changes
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
          
          // Show toast notification for new notification
          const notification = payload.new as Notification;
          toast(notification.title, {
            description: notification.content,
          });
        }
      )
      .subscribe();
    
    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user, queryClient]);

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    isLoading,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
}
