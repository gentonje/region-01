import { Database } from "@/integrations/supabase/types";

export type ProductCategory = Database["public"]["Enums"]["product_category"];

export interface ProductFormData {
  title: string;
  description: string;
  price: string;
  category: ProductCategory;
  available_quantity: string;
}

export interface Product extends Omit<ProductFormData, 'price' | 'available_quantity'> {
  id: string;
  user_id?: string;
  seller_id?: string;
  shop_id?: string;
  price: number;
  available_quantity: number;
  storage_path: string;
  created_at: string;
  in_stock?: boolean;
  views?: number;
  likes?: number;
  average_rating?: number;
  product_status?: string;
  shipping_info?: string;
}