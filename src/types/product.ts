export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  storage_path: string;
  currency: string;
  average_rating: number;
  category: string;
  in_stock: boolean;
  product_images: { storage_path: string; is_main: boolean }[];
  seller_id: string;
  user_id?: string;
  shop_id?: string;
  available_quantity?: number;
  views?: number;
  likes?: number;
  product_status?: string;
  shipping_info?: string;
}