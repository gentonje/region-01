
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Check, Bell } from 'lucide-react';
import { ImageLoader } from '@/components/ImageLoader';
import { supabase } from '@/integrations/supabase/client';

interface NotificationListProps {
  onClose?: () => void;
}

export const NotificationList = ({ onClose = () => {} }: NotificationListProps) => {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read
    markAsRead(notification.id);
    
    // Navigate based on notification type and content
    if (notification.link) {
      // If notification has related product, navigate to product detail
      if (notification.related_product_id && notification.link.includes('/products/')) {
        // First close the notification panel
        onClose();
        // Then navigate to the product detail page
        navigate(`/products`, { state: { selectedProductId: notification.related_product_id } });
      } else {
        // For other links, just navigate directly
        navigate(notification.link);
        onClose();
      }
    } else if (notification.related_product_id) {
      // Fallback if link is not provided but product ID is
      onClose();
      navigate(`/products`, { state: { selectedProductId: notification.related_product_id } });
    }
  };

  // Helper to generate image URL from storage path
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    
    if (path.startsWith('http')) return path;
    
    return supabase.storage
      .from('images')
      .getPublicUrl(path).data.publicUrl;
  };

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
        <h3 className="text-sm font-medium">Notifications</h3>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => markAllAsRead()}
            className="text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground">
              You'll see notifications for reviews and product updates here
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/50 border-b last:border-b-0
                  ${notification.read ? 'bg-background' : 'bg-accent/20'}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                `}
                onClick={() => handleNotificationClick(notification)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNotificationClick(notification);
                  }
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {notification.thumbnail_url ? (
                    <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                      <ImageLoader 
                        src={getImageUrl(notification.thumbnail_url) || '/placeholder.svg'}
                        alt=""
                        className="h-full w-full object-cover"
                        width={40}
                        height={40}
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded flex items-center justify-center bg-sky-100 dark:bg-sky-900">
                      {notification.type === 'product_expiry' ? (
                        <Bell className="h-5 w-5 text-amber-500" />
                      ) : notification.type === 'similar_product' ? (
                        <Bell className="h-5 w-5 text-green-500" />
                      ) : (
                        <Bell className="h-5 w-5 text-sky-500" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-sky-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
