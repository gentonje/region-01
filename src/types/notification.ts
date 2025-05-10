
export interface Notification {
  id: string;
  user_id: string;
  type: 'review_comment' | 'review_reply' | 'product_message' | 'product_expiry' | 'similar_product';
  title: string;
  content: string;
  related_product_id: string | null;
  related_review_id: string | null;
  read: boolean;
  created_at: string;
  link: string | null;
  thumbnail_url: string | null;
}
